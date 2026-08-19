package com.collegebook.collegebookbackend.auth.bloom;

import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.google.common.hash.BloomFilter;
import com.google.common.hash.Funnels;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class HandleBloomFilterService {

    private static final Logger log = LoggerFactory.getLogger(HandleBloomFilterService.class);

    // 10 Million users capacity with 1% false positive rate (~11.4 MB in RAM)
    public static final int EXPECTED_INSERTIONS = 10_000_000;
    public static final double FPP = 0.01;

    private static final Pattern HANDLE_PATTERN = Pattern.compile("^[a-zA-Z0-9._]{3,30}$");

    private static final Set<String> RESERVED_HANDLES = Set.of(
            "admin", "administrator", "root", "api", "auth", "collegebook", "system",
            "support", "help", "official", "moderator", "mod", "null", "undefined"
    );

    private final ProfileRepository profileRepository;
    private volatile BloomFilter<String> bloomFilter;

    public HandleBloomFilterService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @PostConstruct
    public synchronized void init() {
        log.info("Initializing Handle Bloom Filter for {} users (FPP: {})...", EXPECTED_INSERTIONS, FPP);
        this.bloomFilter = BloomFilter.create(
                Funnels.stringFunnel(StandardCharsets.UTF_8),
                EXPECTED_INSERTIONS,
                FPP
        );

        try {
            List<String> handles = profileRepository.findAllHandles();
            if (handles != null) {
                for (String h : handles) {
                    if (h != null && !h.isBlank()) {
                        bloomFilter.put(normalize(h));
                    }
                }
                log.info("Loaded {} existing handles into Bloom Filter.", handles.size());
            }
        } catch (Exception e) {
            log.warn("Could not pre-load handles into Bloom Filter (database might be empty or initializing): {}", e.getMessage());
        }
    }

    public synchronized void resetAndReload() {
        init();
    }

    public boolean isValidHandleFormat(String handle) {
        if (handle == null) return false;
        String clean = normalize(handle);
        if (clean.length() < 3 || clean.length() > 30) return false;
        if (!HANDLE_PATTERN.matcher(clean).matches()) return false;
        return !RESERVED_HANDLES.contains(clean);
    }

    public boolean isHandleAvailable(String handle) {
        if (handle == null || !isValidHandleFormat(handle)) {
            return false;
        }

        String clean = normalize(handle);

        // 1. Fast Bloom Filter check
        // If Bloom Filter says NO (false), the handle is 100% guaranteed to NOT exist in the database!
        if (bloomFilter != null && !bloomFilter.mightContain(clean)) {
            return true;
        }

        // 2. If Bloom Filter says YES (mightContain), query the DB to rule out the ~1% false positive
        boolean existsInDb = profileRepository.existsByHandleIgnoreCase(clean);
        return !existsInDb;
    }

    public void addHandle(String handle) {
        if (handle == null || handle.isBlank()) return;
        String clean = normalize(handle);
        if (bloomFilter != null) {
            bloomFilter.put(clean);
        }
    }

    public String normalize(String handle) {
        return handle.trim().toLowerCase().replaceFirst("^@", "");
    }
}
