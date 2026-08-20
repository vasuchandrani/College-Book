package com.collegebook.collegebookbackend.profile.service.impl;

import com.collegebook.collegebookbackend.auth.entity.EmailOtp;
import com.collegebook.collegebookbackend.auth.repository.EmailOtpRepository;
import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.collegebook.collegebookbackend.profile.service.ProfileService;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.collegebook.collegebookbackend.storage.service.StorageService;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final StorageService storageService;

    public ProfileServiceImpl(
            ProfileRepository profileRepository,
            EmailOtpRepository emailOtpRepository,
            EmailService emailService,
            StorageService storageService
    ) {
        this.profileRepository = profileRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.emailService = emailService;
        this.storageService = storageService;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "profiles", key = "#userId")
    public ProfileDto getMyProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));
        return toDto(profile);
    }

    @Override
    @Transactional
    @CachePut(value = "profiles", key = "#userId")
    @org.springframework.cache.annotation.CacheEvict(value = "publicProfiles", allEntries = true)
    public ProfileDto updateMyProfile(UUID userId, ProfileUpdateDto updateDto) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));

        if (updateDto.getFullName() != null && !updateDto.getFullName().isBlank()) {
            profile.setFullName(updateDto.getFullName().trim());
        }
        if (updateDto.getDefaultBio() != null) {
            profile.setDefaultBio(updateDto.getDefaultBio().trim());
        }
        if (updateDto.getBioExtra() != null) {
            profile.setBioExtra(updateDto.getBioExtra());
        }
        if (updateDto.getAvatarUrl() != null) {
            profile.setAvatarUrl(updateDto.getAvatarUrl());
        }
        if (updateDto.getGithubUrl() != null) {
            profile.setGithubUrl(updateDto.getGithubUrl());
        }
        if (updateDto.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(updateDto.getLinkedinUrl());
        }
        if (updateDto.getWebsiteUrl() != null) {
            profile.setWebsiteUrl(updateDto.getWebsiteUrl());
        }
        if (updateDto.getCustomLinks() != null) {
            profile.setCustomLinks(updateDto.getCustomLinks());
        }
        if (updateDto.getContactDetails() != null) {
            profile.setContactDetails(updateDto.getContactDetails());
        }
        if (updateDto.getIsPublic() != null) {
            profile.setPublic(updateDto.getIsPublic());
        }

        Profile updated = profileRepository.save(profile);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PublicProfileDto> getStudentsByCollege(UUID collegeId, UUID excludeUserId) {
        return profileRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getCollege() != null 
                        && collegeId.equals(p.getUser().getCollege().getId())
                        && (excludeUserId == null || !excludeUserId.equals(p.getUserId())))
                .map(this::toPublicDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "publicProfiles", key = "#slug")
    public PublicProfileDto getStudentBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new AppException(ErrorCode.NOT_FOUND, "Student profile not found");
        }
        String cleanSlug = slug.trim();
        java.util.Optional<Profile> profileOpt = profileRepository.findByHandleIgnoreCase(cleanSlug);
        if (profileOpt.isEmpty()) {
            profileOpt = profileRepository.findFirstByFullNameIgnoreCase(cleanSlug);
        }
        if (profileOpt.isEmpty()) {
            try {
                UUID userId = UUID.fromString(cleanSlug);
                profileOpt = profileRepository.findByUserId(userId);
            } catch (IllegalArgumentException ignored) {
            }
        }
        Profile profile = profileOpt
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Student profile not found"));

        return toPublicDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "publicProfiles", key = "#handleOrName")
    public java.util.Optional<PublicProfileDto> findStudentByHandleOrName(String handleOrName) {
        if (handleOrName == null || handleOrName.isBlank()) {
            return java.util.Optional.empty();
        }
        String cleanSlug = handleOrName.trim().replaceFirst("^@", "");
        java.util.Optional<Profile> profileOpt = profileRepository.findByHandleIgnoreCase(cleanSlug);
        if (profileOpt.isEmpty()) {
            profileOpt = profileRepository.findFirstByFullNameIgnoreCase(cleanSlug);
        }
        if (profileOpt.isEmpty()) {
            try {
                UUID userId = UUID.fromString(cleanSlug);
                profileOpt = profileRepository.findByUserId(userId);
            } catch (IllegalArgumentException ignored) {
            }
        }
        return profileOpt.map(this::toPublicDto);
    }

    @Override
    @Transactional
    public void sendMemoryBookEmailOtp(UUID userId, String targetEmail) {
        profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));

        if (targetEmail == null || targetEmail.isBlank() || !targetEmail.contains("@")) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Please provide a valid email address");
        }

        String email = targetEmail.trim().toLowerCase();
        String purpose = "MEMORY_BOOK_EMAIL_VERIFY";

        // 1. Check 5-minute cooldown (300s)
        emailOtpRepository.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose).ifPresent(lastOtp -> {
            if (lastOtp.getCreatedAt() != null) {
                long elapsedSeconds = Duration.between(lastOtp.getCreatedAt(), Instant.now()).toSeconds();
                if (elapsedSeconds < 300) {
                    long remainingWait = 300 - elapsedSeconds;
                    throw new AppException(
                            ErrorCode.OTP_COOLDOWN_ACTIVE,
                            "Please wait " + remainingWait + " seconds before requesting another verification code."
                    );
                }
            }
        });

        // 2. Check hourly cap (max 5 in 1 hour)
        long hourlyCount = emailOtpRepository.countByEmailAndCreatedAtAfter(email, Instant.now().minus(Duration.ofHours(1)));
        if (hourlyCount >= 5) {
            throw new AppException(
                    ErrorCode.OTP_LIMIT_REACHED,
                    "Maximum verification requests reached for this email (5 per hour). Please try again in 1 hour."
            );
        }

        // 3. Invalidate previous unconsumed OTPs
        List<EmailOtp> pendingOtps = emailOtpRepository.findByEmailAndPurposeAndConsumedAtIsNull(email, purpose);
        if (!pendingOtps.isEmpty()) {
            for (EmailOtp o : pendingOtps) {
                o.setConsumedAt(Instant.now());
            }
            emailOtpRepository.saveAll(pendingOtps);
        }

        String rawOtp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        String otpHash = hashString(rawOtp);

        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setOtpHash(otpHash);
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plus(Duration.ofMinutes(10)));
        emailOtpRepository.save(otp);

        emailService.sendMemoryBookOtpEmail(email, rawOtp);
    }

    @Override
    @Transactional
    public ProfileDto verifyAndSetMemoryBookEmail(UUID userId, String targetEmail, String otpCode) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));

        if (targetEmail == null || targetEmail.isBlank() || otpCode == null || otpCode.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Email and OTP code are required");
        }

        String email = targetEmail.trim().toLowerCase();
        String rawOtp = otpCode.trim();
        String otpHash = hashString(rawOtp);

        Optional<EmailOtp> latestOtp = emailOtpRepository
                .findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(email, "MEMORY_BOOK_EMAIL_VERIFY");

        if (latestOtp.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_OTP, "No active OTP verification request found for this email");
        }

        EmailOtp otp = latestOtp.get();
        if (otp.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED, "Verification code has expired");
        }
        if (otp.getAttempts() >= 5) {
            otp.setConsumedAt(Instant.now());
            emailOtpRepository.save(otp);
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS, "Max OTP verification attempts exceeded. Please request a new code.");
        }

        if (!otp.getOtpHash().equals(otpHash)) {
            otp.setAttempts(otp.getAttempts() + 1);
            if (otp.getAttempts() >= 5) {
                otp.setConsumedAt(Instant.now());
            }
            emailOtpRepository.save(otp);
            if (otp.getAttempts() >= 5) {
                throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS, "Max OTP verification attempts exceeded. Please request a new code.");
            }
            throw new AppException(ErrorCode.INVALID_OTP, "Invalid verification code");
        }

        profile.setMemoryBookEmail(email);
        profileRepository.save(profile);

        otp.setConsumedAt(Instant.now());
        emailOtpRepository.save(otp);

        return toDto(profile);
    }

    @Override
    @Transactional
    public ProfileDto removeMemoryBookEmail(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));

        profile.setMemoryBookEmail(null);
        profileRepository.save(profile);
        return toDto(profile);
    }

    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private PublicProfileDto toPublicDto(Profile profile) {
        PublicProfileDto dto = new PublicProfileDto();
        dto.setUserId(profile.getUserId());
        dto.setSlug(profile.getHandle());
        dto.setHandle(profile.getHandle());
        dto.setFullName(profile.getFullName());
        dto.setInitials(profile.getInitials());
        dto.setCourseName(profile.getCourse() != null ? profile.getCourse().getName() : null);
        if (profile.getUser() != null && profile.getUser().getCollege() != null) {
            dto.setCollegeName(profile.getUser().getCollege().getName());
            dto.setCollegeShortName(profile.getUser().getCollege().getShortName());
            dto.setCollegeSlug(profile.getUser().getCollege().getSlug());
        }
        dto.setCurrentYear(profile.getCurrentYear());
        String defaultBio = profile.getDefaultBio();
        if (profile.getCurrentYear() != null && profile.getCourse() != null) {
            String cName = profile.getCourse().getShortName() != null ? profile.getCourse().getShortName() : profile.getCourse().getName();
            int y = profile.getCurrentYear();
            String ySuffix = y == 1 ? "st" : y == 2 ? "nd" : y == 3 ? "rd" : "th";
            defaultBio = cName + " • " + y + ySuffix + " Year";
        }
        dto.setDefaultBio(defaultBio);
        dto.setBioExtra(profile.getBioExtra());
        dto.setAvatarUrl(resolveAvatarUrl(profile.getAvatarUrl()));
        dto.setGithubUrl(profile.getGithubUrl());
        dto.setLinkedinUrl(profile.getLinkedinUrl());
        dto.setWebsiteUrl(profile.getWebsiteUrl());
        dto.setCustomLinks(profile.getCustomLinks());
        dto.setContactDetails(profile.getContactDetails());
        return dto;
    }

    private String resolveAvatarUrl(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return null;
        }
        if (avatarUrl.startsWith("avatars/") || avatarUrl.contains(".amazonaws.com/")) {
            try {
                return storageService.resolveAccessUrl(avatarUrl, "S3");
            } catch (Exception e) {
                return avatarUrl;
            }
        }
        return avatarUrl;
    }

    private ProfileDto toDto(Profile p) {
        ProfileDto dto = new ProfileDto();
        dto.setUserId(p.getUserId());
        dto.setHandle(p.getHandle());
        dto.setFullName(p.getFullName());
        dto.setInitials(p.getInitials());
        dto.setGender(p.getGender() != null ? p.getGender().name() : null);
        if (p.getUser() != null && p.getUser().getCollege() != null) {
            dto.setCollegeId(p.getUser().getCollege().getId());
            dto.setCollegeName(p.getUser().getCollege().getName());
            dto.setCollegeShortName(p.getUser().getCollege().getShortName());
            dto.setCollegeSlug(p.getUser().getCollege().getSlug());
        }
        if (p.getCourse() != null) {
            dto.setCourseId(p.getCourse().getId());
            dto.setCourseName(p.getCourse().getName());
        }
        dto.setCurrentYear(p.getCurrentYear() != null ? (int) p.getCurrentYear() : null);
        String defaultBio = p.getDefaultBio();
        if (p.getCurrentYear() != null && p.getCourse() != null) {
            String cName = p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName();
            int y = p.getCurrentYear();
            String ySuffix = y == 1 ? "st" : y == 2 ? "nd" : y == 3 ? "rd" : "th";
            defaultBio = cName + " • " + y + ySuffix + " Year";
        }
        dto.setDefaultBio(defaultBio);
        dto.setBioExtra(p.getBioExtra());
        dto.setAvatarUrl(resolveAvatarUrl(p.getAvatarUrl()));
        dto.setGithubUrl(p.getGithubUrl());
        dto.setLinkedinUrl(p.getLinkedinUrl());
        dto.setWebsiteUrl(p.getWebsiteUrl());
        dto.setMemoryBookEmail(p.getMemoryBookEmail());
        dto.setCustomLinks(p.getCustomLinks());
        dto.setContactDetails(p.getContactDetails());
        dto.setPublic(p.isPublic());
        return dto;
    }
}
