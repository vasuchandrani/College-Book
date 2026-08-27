package com.collegebook.collegebookbackend.profile.service.impl;

import com.collegebook.collegebookbackend.auth.entity.EmailOtp;
import com.collegebook.collegebookbackend.auth.repository.EmailOtpRepository;
import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.entity.Department;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.college.repository.DepartmentRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.collegebook.collegebookbackend.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final EmailService emailService;
    private final StorageService storageService;
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "profiles", key = "#userId")
    public ProfileDto getMyProfile(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));
        return toDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public com.collegebook.collegebookbackend.profile.dto.ProfileHeaderDto getMyProfileHeader(UUID userId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));
        return toHeaderDto(p);
    }

    @Override
    @Transactional(readOnly = true)
    public com.collegebook.collegebookbackend.profile.dto.ProfileAboutDto getMyProfileAbout(UUID userId) {
        Profile p = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Profile not found"));
        return toAboutDto(p);
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
        
        boolean academicChanged = false;
        if (updateDto.getCourseId() != null) {
            Course course = courseRepository.findById(updateDto.getCourseId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Course not found"));
            profile.setCourse(course);
            academicChanged = true;
        }
        if (updateDto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(updateDto.getDepartmentId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Department not found"));
            profile.setDepartment(department);
            academicChanged = true;
        }
        if (updateDto.getCurrentYear() != null) {
            profile.setCurrentYear(updateDto.getCurrentYear());
            academicChanged = true;
        }

        if (academicChanged || updateDto.getDefaultBio() == null || updateDto.getDefaultBio().isBlank()) {
            String courseDisplay = profile.getCourse() != null
                    ? (profile.getCourse().getShortName() != null ? profile.getCourse().getShortName() : profile.getCourse().getName())
                    : "B.Tech";
            String deptDisplay = profile.getDepartment() != null ? profile.getDepartment().getName() : "";
            String recomputedBio = deptDisplay.isBlank() ? courseDisplay : courseDisplay + " " + deptDisplay;
            profile.setDefaultBio(recomputedBio);
        } else {
            profile.setDefaultBio(updateDto.getDefaultBio().trim());
        }

        if (updateDto.getBioExtra() != null) {
            profile.setBioExtra(updateDto.getBioExtra());
        }
        if (updateDto.getAvatarUrl() != null) {
            profile.setAvatarUrl(updateDto.getAvatarUrl().isBlank() ? null : updateDto.getAvatarUrl().trim());
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
        Profile profile = findProfileBySlugOrThrow(slug);
        return toPublicDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public com.collegebook.collegebookbackend.profile.dto.PublicProfileHeaderDto getStudentHeaderBySlug(String slug) {
        Profile profile = findProfileBySlugOrThrow(slug);
        return toPublicHeaderDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public com.collegebook.collegebookbackend.profile.dto.PublicProfileAboutDto getStudentAboutBySlug(String slug) {
        Profile profile = findProfileBySlugOrThrow(slug);
        return toPublicAboutDto(profile);
    }

    private Profile findProfileBySlugOrThrow(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new AppException(ErrorCode.NOT_FOUND, "Student profile not found");
        }
        String cleanSlug = slug.trim().replaceFirst("^@", "");
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
        return profileOpt.orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Student profile not found"));
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
        if (profile.getCourse() != null) {
            dto.setCourseName(profile.getCourse().getName());
            dto.setCourseShortName(profile.getCourse().getShortName() != null ? profile.getCourse().getShortName() : profile.getCourse().getName());
        }
        if (profile.getDepartment() != null) {
            dto.setDepartmentName(profile.getDepartment().getName());
            dto.setDepartmentShortName(profile.getDepartment().getShortName());
        }
        if (profile.getUser() != null && profile.getUser().getCollege() != null) {
            dto.setCollegeName(profile.getUser().getCollege().getName());
            dto.setCollegeShortName(profile.getUser().getCollege().getShortName());
            dto.setCollegeSlug(profile.getUser().getCollege().getSlug());
        }
        dto.setCurrentYear(profile.getCurrentYear());
        String defaultBio = profile.getDefaultBio();
        if (profile.getCourse() != null) {
            String cName = profile.getCourse().getShortName() != null ? profile.getCourse().getShortName() : profile.getCourse().getName();
            String dName = profile.getDepartment() != null ? profile.getDepartment().getName() : "";
            defaultBio = dName.isBlank() ? cName : cName + " " + dName;
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
            dto.setCourseShortName(p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName());
        }
        if (p.getDepartment() != null) {
            dto.setDepartmentId(p.getDepartment().getId());
            dto.setDepartmentName(p.getDepartment().getName());
            dto.setDepartmentShortName(p.getDepartment().getShortName());
        }
        dto.setCurrentYear(p.getCurrentYear() != null ? (int) p.getCurrentYear() : null);
        String defaultBio = p.getDefaultBio();
        if (p.getCourse() != null) {
            String cName = p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName();
            String dName = p.getDepartment() != null ? p.getDepartment().getName() : "";
            defaultBio = dName.isBlank() ? cName : cName + " " + dName;
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

    private com.collegebook.collegebookbackend.profile.dto.ProfileHeaderDto toHeaderDto(Profile p) {
        String defaultBio = p.getDefaultBio();
        if (p.getCourse() != null) {
            String cName = p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName();
            String dName = p.getDepartment() != null ? p.getDepartment().getName() : "";
            defaultBio = dName.isBlank() ? cName : cName + " " + dName;
        }

        return com.collegebook.collegebookbackend.profile.dto.ProfileHeaderDto.builder()
                .userId(p.getUserId())
                .handle(p.getHandle())
                .fullName(p.getFullName())
                .initials(p.getInitials())
                .gender(p.getGender() != null ? p.getGender().name() : null)
                .collegeId(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getId() : null)
                .collegeName(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getName() : null)
                .collegeShortName(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getShortName() : null)
                .collegeSlug(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getSlug() : null)
                .courseId(p.getCourse() != null ? p.getCourse().getId() : null)
                .courseName(p.getCourse() != null ? p.getCourse().getName() : null)
                .courseShortName(p.getCourse() != null ? (p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName()) : null)
                .departmentId(p.getDepartment() != null ? p.getDepartment().getId() : null)
                .departmentName(p.getDepartment() != null ? p.getDepartment().getName() : null)
                .departmentShortName(p.getDepartment() != null ? p.getDepartment().getShortName() : null)
                .currentYear(p.getCurrentYear() != null ? (int) p.getCurrentYear() : null)
                .defaultBio(defaultBio)
                .avatarUrl(resolveAvatarUrl(p.getAvatarUrl()))
                .isPublic(p.isPublic())
                .build();
    }

    private com.collegebook.collegebookbackend.profile.dto.ProfileAboutDto toAboutDto(Profile p) {
        return com.collegebook.collegebookbackend.profile.dto.ProfileAboutDto.builder()
                .userId(p.getUserId())
                .bioExtra(p.getBioExtra())
                .githubUrl(p.getGithubUrl())
                .linkedinUrl(p.getLinkedinUrl())
                .websiteUrl(p.getWebsiteUrl())
                .memoryBookEmail(p.getMemoryBookEmail())
                .customLinks(p.getCustomLinks())
                .contactDetails(p.getContactDetails())
                .build();
    }

    private com.collegebook.collegebookbackend.profile.dto.PublicProfileHeaderDto toPublicHeaderDto(Profile p) {
        String defaultBio = p.getDefaultBio();
        if (p.getCourse() != null) {
            String cName = p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName();
            String dName = p.getDepartment() != null ? p.getDepartment().getName() : "";
            defaultBio = dName.isBlank() ? cName : cName + " " + dName;
        }

        return com.collegebook.collegebookbackend.profile.dto.PublicProfileHeaderDto.builder()
                .userId(p.getUserId())
                .handle(p.getHandle())
                .slug(p.getHandle())
                .fullName(p.getFullName())
                .initials(p.getInitials())
                .courseName(p.getCourse() != null ? p.getCourse().getName() : null)
                .courseShortName(p.getCourse() != null ? (p.getCourse().getShortName() != null ? p.getCourse().getShortName() : p.getCourse().getName()) : null)
                .departmentName(p.getDepartment() != null ? p.getDepartment().getName() : null)
                .departmentShortName(p.getDepartment() != null ? p.getDepartment().getShortName() : null)
                .collegeName(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getName() : null)
                .collegeShortName(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getShortName() : null)
                .collegeSlug(p.getUser() != null && p.getUser().getCollege() != null ? p.getUser().getCollege().getSlug() : null)
                .currentYear(p.getCurrentYear())
                .defaultBio(defaultBio)
                .avatarUrl(resolveAvatarUrl(p.getAvatarUrl()))
                .build();
    }

    private com.collegebook.collegebookbackend.profile.dto.PublicProfileAboutDto toPublicAboutDto(Profile p) {
        return com.collegebook.collegebookbackend.profile.dto.PublicProfileAboutDto.builder()
                .userId(p.getUserId())
                .handle(p.getHandle())
                .bioExtra(p.getBioExtra())
                .githubUrl(p.getGithubUrl())
                .linkedinUrl(p.getLinkedinUrl())
                .websiteUrl(p.getWebsiteUrl())
                .customLinks(p.getCustomLinks())
                .contactDetails(p.getContactDetails())
                .build();
    }
}
