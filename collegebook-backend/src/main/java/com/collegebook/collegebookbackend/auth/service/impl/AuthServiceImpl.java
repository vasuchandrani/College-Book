package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.bloom.HandleBloomFilterService;
import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse;
import com.collegebook.collegebookbackend.auth.dto.LoginRequest;
import com.collegebook.collegebookbackend.auth.dto.LogoutRequest;
import com.collegebook.collegebookbackend.auth.dto.PasswordResetRequest;
import com.collegebook.collegebookbackend.auth.dto.RefreshTokenRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpRequest;
import com.collegebook.collegebookbackend.auth.dto.SignupRequest;
import com.collegebook.collegebookbackend.auth.dto.UserDto;
import com.collegebook.collegebookbackend.auth.dto.VerifyOtpRequest;
import com.collegebook.collegebookbackend.auth.entity.AccountStatus;
import com.collegebook.collegebookbackend.auth.entity.AppRole;
import com.collegebook.collegebookbackend.auth.entity.EmailOtp;
import com.collegebook.collegebookbackend.auth.entity.PasswordReset;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.entity.UserRole;
import com.collegebook.collegebookbackend.auth.repository.EmailOtpRepository;
import com.collegebook.collegebookbackend.auth.repository.PasswordResetRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRoleRepository;
import com.collegebook.collegebookbackend.auth.service.AuthService;
import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.auth.service.TokenService;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.repository.CollegeRepository;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
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

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final CollegeRepository collegeRepository;
    private final CourseRepository courseRepository;
    private final ProfileRepository profileRepository;
    private final HandleBloomFilterService handleBloomFilterService;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final EmailService emailService;

    public AuthServiceImpl(
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            EmailOtpRepository emailOtpRepository,
            PasswordResetRepository passwordResetRepository,
            CollegeRepository collegeRepository,
            CourseRepository courseRepository,
            ProfileRepository profileRepository,
            HandleBloomFilterService handleBloomFilterService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenService tokenService,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.collegeRepository = collegeRepository;
        this.courseRepository = courseRepository;
        this.profileRepository = profileRepository;
        this.handleBloomFilterService = handleBloomFilterService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public com.collegebook.collegebookbackend.auth.dto.SendOtpResponse sendOtp(SendOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String purpose = request.getPurpose() != null ? request.getPurpose() : "SIGNUP";

        // If purpose is SIGNUP, check if user already exists BEFORE sending OTP
        if ("SIGNUP".equalsIgnoreCase(purpose)) {
            if (userRepository.existsByEmailIgnoreCase(email)) {
                return com.collegebook.collegebookbackend.auth.dto.SendOtpResponse.builder()
                        .sent(false)
                        .userExists(true)
                        .message("An account with this email already exists. Please sign in instead.")
                        .build();
            }
        }

        // Enforce 5-minute cooldown and hourly/daily limits per email
        enforceOtpRateLimits(email, purpose);

        // 6-digit OTP code
        String rawOtp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        String otpHash = hashString(rawOtp);

        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setOtpHash(otpHash);
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plus(Duration.ofMinutes(10)));
        emailOtpRepository.save(otp);

        emailService.sendOtpEmail(email, rawOtp);

        return com.collegebook.collegebookbackend.auth.dto.SendOtpResponse.builder()
                .sent(true)
                .userExists(false)
                .message("OTP sent successfully")
                .build();
    }

    @Override
    @Transactional
    public boolean verifyOtp(VerifyOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String purpose = request.getPurpose() != null ? request.getPurpose() : "SIGNUP";
        Optional<EmailOtp> otpOpt = emailOtpRepository.findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(
                email, purpose
        );

        if (otpOpt.isEmpty()) {
            throw new AppException(ErrorCode.OTP_EXPIRED, "No valid OTP found or OTP expired");
        }

        EmailOtp otp = otpOpt.get();
        if (otp.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.OTP_EXPIRED, "OTP has expired");
        }

        if (otp.getAttempts() >= 5) {
            otp.setConsumedAt(Instant.now());
            emailOtpRepository.save(otp);
            throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS, "Max OTP verification attempts exceeded. Please request a new code.");
        }

        String inputHash = hashString(request.getCode().trim());
        if (!inputHash.equalsIgnoreCase(otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            if (otp.getAttempts() >= 5) {
                otp.setConsumedAt(Instant.now());
            }
            emailOtpRepository.save(otp);
            if (otp.getAttempts() >= 5) {
                throw new AppException(ErrorCode.OTP_MAX_ATTEMPTS, "Max OTP verification attempts exceeded. Please request a new code.");
            }
            throw new AppException(ErrorCode.INVALID_OTP, "Invalid OTP code");
        }

        otp.setConsumedAt(Instant.now());
        emailOtpRepository.save(otp);

        return true;
    }

    @Override
    @Transactional
    public AuthResponseDto signup(SignupRequest request, String userAgent, String ip) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS, "An account with this email already exists");
        }

        College college = null;
        if (request.getCollegeId() != null) {
            college = collegeRepository.findById(request.getCollegeId())
                    .orElse(null);
        }
        if (college == null) {
            String emailDomain = email.substring(email.indexOf("@") + 1);
            college = collegeRepository.findAll().stream()
                    .filter(c -> c.getEmailDomains() != null && c.getEmailDomains().stream().anyMatch(d -> d.equalsIgnoreCase(emailDomain)))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.DOMAIN_NOT_ALLOWED, "No supported college found for email domain @" + emailDomain));
        }

        // Domain check
        String domain = email.substring(email.indexOf("@") + 1);
        final College finalCollege = college;
        boolean domainMatched = finalCollege.getEmailDomains().stream().anyMatch(d -> d.equalsIgnoreCase(domain));
        if (!domainMatched) {
            throw new AppException(ErrorCode.DOMAIN_NOT_ALLOWED, "Email domain does not match college allowed domains");
        }

        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElse(null);
        }
        if (course == null) {
            List<Course> collegeCourses = courseRepository.findByCollegeId(finalCollege.getId());
            if (!collegeCourses.isEmpty()) {
                course = collegeCourses.get(0);
            } else {
                throw new AppException(ErrorCode.NOT_FOUND, "No course configured for this college");
            }
        }

        // Create User
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCollege(college);
        user.setStatus(AccountStatus.ACTIVE);
        user.setEmailVerifiedAt(Instant.now());
        user.setLastLoginAt(Instant.now());

        user = userRepository.save(user);

        // Assign STUDENT role
        UserRole role = new UserRole(user, AppRole.STUDENT);
        userRoleRepository.save(role);

        // Create Profile
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setFullName(request.getFullName().trim());
        profile.setInitials(deriveInitials(request.getFullName().trim()));
        
        String handleToSet;
        if (request.getHandle() != null && !request.getHandle().isBlank()) {
            String candidate = request.getHandle().trim();
            if (!handleBloomFilterService.isValidHandleFormat(candidate)) {
                throw new AppException(ErrorCode.INVALID_HANDLE, "Handle must be 3-30 characters with letters, numbers, '.', or '_'");
            }
            if (!handleBloomFilterService.isHandleAvailable(candidate)) {
                throw new AppException(ErrorCode.HANDLE_ALREADY_EXISTS, "Username @" + candidate + " is already taken");
            }
            handleToSet = handleBloomFilterService.normalize(candidate);
        } else {
            handleToSet = deriveUniqueHandle(request.getFullName().trim());
        }
        profile.setHandle(handleToSet);
        handleBloomFilterService.addHandle(handleToSet);
        if (request.getGender() != null) {
            try {
                String genderVal = request.getGender().trim().toUpperCase().replace("-", "_").replace(" ", "_");
                profile.setGender(com.collegebook.collegebookbackend.profile.entity.Gender.valueOf(genderVal));
            } catch (Exception e) {
                profile.setGender(com.collegebook.collegebookbackend.profile.entity.Gender.PREFER_NOT_TO_SAY);
            }
        } else {
            profile.setGender(com.collegebook.collegebookbackend.profile.entity.Gender.PREFER_NOT_TO_SAY);
        }
        profile.setCourse(course);
        profile.setCurrentYear(request.getCurrentYear() != null ? request.getCurrentYear().shortValue() : null);

        String courseDisplay = course.getShortName() != null ? course.getShortName() : course.getName();
        String defaultBio = courseDisplay + " • " + request.getCurrentYear() + ordinalSuffix(request.getCurrentYear()) + " Year";
        profile.setDefaultBio(defaultBio);

        profileRepository.save(profile);

        // Generate Tokens
        List<String> roles = List.of(AppRole.STUDENT.name());
        String accessToken = jwtService.generateAccessToken(user.getId(), college.getId(), roles);
        TokenService.RefreshTokenResult refreshTokenResult = tokenService.createRefreshToken(user, null, userAgent, ip);

        UserDto userDto = toUserDto(user, profile, roles);
        return new AuthResponseDto(accessToken, refreshTokenResult.rawToken(), userDto);
    }

    @Override
    @Transactional
    public AuthResponseDto login(LoginRequest request, String userAgent, String ip) {
        if (request.getEmail() == null || request.getEmail().isBlank() || request.getPassword() == null) {
            return AuthResponseDto.failure("INVALID_CREDENTIALS", "Incorrect email or password. Please verify your credentials.");
        }

        if ("demo@collegebook.edu".equalsIgnoreCase(request.getEmail().trim())) {
            Optional<User> demoUserOpt = userRepository.findByEmailIgnoreCase("demo@collegebook.edu");
            if (demoUserOpt.isEmpty()) {
                College college = collegeRepository.findBySlug("dharmsinh-desai-university-nadiad")
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "DDU college not found"));
                
                Course course = courseRepository.findByCollegeId(college.getId()).stream()
                        .filter(c -> "B.Tech IT".equalsIgnoreCase(c.getShortName()))
                        .findFirst()
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "B.Tech IT course not found"));
                
                User user = new User();
                user.setEmail("demo@collegebook.edu");
                user.setPasswordHash(passwordEncoder.encode("demo123"));
                user.setCollege(college);
                user.setStatus(AccountStatus.ACTIVE);
                user.setEmailVerifiedAt(Instant.now());
                user.setLastLoginAt(Instant.now());
                user = userRepository.save(user);

                UserRole role = new UserRole(user, AppRole.STUDENT);
                userRoleRepository.save(role);

                Profile profile = new Profile();
                profile.setUser(user);
                profile.setFullName("Demo Explorer");
                profile.setInitials("DE");
                profile.setHandle("demo");
                profile.setGender(com.collegebook.collegebookbackend.profile.entity.Gender.MALE);
                profile.setCourse(course);
                profile.setCurrentYear((short) 1);
                profile.setDefaultBio("B.Tech IT • 1st Year");
                profileRepository.save(profile);
                
                handleBloomFilterService.addHandle("demo");
            }
        }

        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            return AuthResponseDto.failure("INVALID_CREDENTIALS", "Incorrect email or password. Please verify your credentials.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return AuthResponseDto.failure("INVALID_CREDENTIALS", "Incorrect email or password. Please verify your credentials.");
        }

        if (user.getStatus() == AccountStatus.SUSPENDED) {
            return AuthResponseDto.failure("ACCOUNT_SUSPENDED", "Account has been suspended");
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        List<String> roles = userRoleRepository.findByUserId(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        Profile profile = profileRepository.findById(user.getId()).orElse(null);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getCollege().getId(), roles);
        TokenService.RefreshTokenResult refreshTokenResult = tokenService.createRefreshToken(user, null, userAgent, ip);

        UserDto userDto = toUserDto(user, profile, roles);
        AuthResponseDto response = new AuthResponseDto(accessToken, refreshTokenResult.rawToken(), userDto);
        response.setSuccess(true);
        return response;
    }

    @Override
    @Transactional
    public AuthResponseDto refresh(RefreshTokenRequest request, String userAgent, String ip) {
        TokenService.AuthResponse tokens = tokenService.rotateRefreshToken(request.getRefreshToken(), userAgent, ip);
        String userIdStr = jwtService.extractUserId(tokens.accessToken());
        User user = userRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<String> roles = userRoleRepository.findByUserId(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();
        Profile profile = profileRepository.findById(user.getId()).orElse(null);

        UserDto userDto = toUserDto(user, profile, roles);
        return new AuthResponseDto(tokens.accessToken(), tokens.refreshToken(), userDto);
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        tokenService.revokeToken(request.getRefreshToken());
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Profile profile = profileRepository.findById(userId).orElse(null);
        List<String> roles = userRoleRepository.findByUserId(userId)
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        return toUserDto(user, profile, roles);
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Please provide a valid email address.");
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "No account found with email " + email.trim() + ". Please check your email or sign up."));

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashString(rawToken);

        PasswordReset reset = new PasswordReset();
        reset.setUser(user);
        reset.setTokenHash(tokenHash);
        reset.setExpiresAt(Instant.now().plus(Duration.ofHours(1)));
        passwordResetRepository.save(reset);

        emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        String tokenHash = hashString(request.getToken().trim());
        PasswordReset reset = passwordResetRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN, "Password reset token is invalid"));

        if (reset.getUsedAt() != null) {
            throw new AppException(ErrorCode.INVALID_TOKEN, "Password reset token has already been used");
        }

        if (reset.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Password reset token has expired");
        }

        User user = reset.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        reset.setUsedAt(Instant.now());
        passwordResetRepository.save(reset);
    }

    @Override
    @Transactional
    public void sendPasswordChangeOtp(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        String email = user.getEmail().trim().toLowerCase();
        enforceOtpRateLimits(email, "PASSWORD_CHANGE");

        String rawOtp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        String otpHash = hashString(rawOtp);

        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setOtpHash(otpHash);
        otp.setPurpose("PASSWORD_CHANGE");
        otp.setExpiresAt(Instant.now().plus(Duration.ofMinutes(10)));
        emailOtpRepository.save(otp);

        emailService.sendPasswordChangeOtpEmail(email, rawOtp);
    }

    @Override
    @Transactional
    public void changePasswordWithOtp(UUID userId, com.collegebook.collegebookbackend.auth.dto.ChangePasswordOtpRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

        String email = user.getEmail().trim().toLowerCase();
        String rawOtp = request.getOtp().trim();
        String otpHash = hashString(rawOtp);

        Optional<EmailOtp> latestOtp = emailOtpRepository
                .findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(email, "PASSWORD_CHANGE");

        if (latestOtp.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_OTP, "No active OTP verification request found");
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

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otp.setConsumedAt(Instant.now());
        emailOtpRepository.save(otp);
    }

    private void enforceOtpRateLimits(String email, String purpose) {
        // 1. Check 5-minute cooldown (300 seconds)
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

        // 3. Check 24-hour cap (max 10 in 24 hours)
        long dailyCount = emailOtpRepository.countByEmailAndCreatedAtAfter(email, Instant.now().minus(Duration.ofDays(1)));
        if (dailyCount >= 10) {
            throw new AppException(
                    ErrorCode.OTP_LIMIT_REACHED,
                    "Daily verification limit reached for this email. Please try again tomorrow."
            );
        }

        // 4. Invalidate any existing unconsumed OTPs for this email and purpose
        List<EmailOtp> pendingOtps = emailOtpRepository.findByEmailAndPurposeAndConsumedAtIsNull(email, purpose);
        if (!pendingOtps.isEmpty()) {
            for (EmailOtp o : pendingOtps) {
                o.setConsumedAt(Instant.now());
            }
            emailOtpRepository.saveAll(pendingOtps);
        }
    }

    private UserDto toUserDto(User user, Profile profile, List<String> roles) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
        if (user.getCollege() != null) {
            dto.setCollegeId(user.getCollege().getId());
            dto.setCollegeName(user.getCollege().getName());
            dto.setCollegeShortName(user.getCollege().getShortName());
            dto.setCollegeSlug(user.getCollege().getSlug());
        }
        dto.setRoles(roles);

        if (profile != null) {
            ProfileDto pDto = new ProfileDto();
            pDto.setUserId(profile.getUserId());
            pDto.setHandle(profile.getHandle());
            pDto.setFullName(profile.getFullName());
            pDto.setInitials(profile.getInitials());
            pDto.setGender(profile.getGender() != null ? profile.getGender().name() : null);
            if (user.getCollege() != null) {
                pDto.setCollegeId(user.getCollege().getId());
                pDto.setCollegeName(user.getCollege().getName());
                pDto.setCollegeShortName(user.getCollege().getShortName());
                pDto.setCollegeSlug(user.getCollege().getSlug());
            }
            if (profile.getCourse() != null) {
                pDto.setCourseId(profile.getCourse().getId());
                pDto.setCourseName(profile.getCourse().getName());
            }
            pDto.setCurrentYear(profile.getCurrentYear() != null ? (int) profile.getCurrentYear() : null);
            pDto.setDefaultBio(profile.getDefaultBio());
            pDto.setBioExtra(profile.getBioExtra());
            pDto.setAvatarUrl(profile.getAvatarUrl());
            pDto.setGithubUrl(profile.getGithubUrl());
            pDto.setLinkedinUrl(profile.getLinkedinUrl());
            pDto.setWebsiteUrl(profile.getWebsiteUrl());
            pDto.setMemoryBookEmail(profile.getMemoryBookEmail());
            pDto.setPublic(profile.isPublic());
            dto.setProfile(pDto);
        }

        return dto;
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

    private String deriveInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "U";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }

    private String deriveUniqueHandle(String fullName) {
        String base = fullName.toLowerCase().replaceAll("[^a-z0-9]", "");
        if (base.isBlank()) base = "user";
        String suffix = UUID.randomUUID().toString().substring(0, 4);
        return base + "_" + suffix;
    }

    private String ordinalSuffix(int i) {
        int mod100 = i % 100;
        int mod10 = i % 10;
        if (mod100 >= 11 && mod100 <= 13) return "th";
        return switch (mod10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };
    }

    @Override
    public HandleAvailabilityResponse checkHandle(String handle) {
        if (handle == null || handle.trim().isBlank()) {
            return HandleAvailabilityResponse.builder()
                    .handle("")
                    .available(false)
                    .message("Handle cannot be empty")
                    .build();
        }
        String clean = handleBloomFilterService.normalize(handle);
        if (!handleBloomFilterService.isValidHandleFormat(clean)) {
            return HandleAvailabilityResponse.builder()
                    .handle(clean)
                    .available(false)
                    .message("Handle must be 3-30 characters (letters, numbers, '.', '_')")
                    .build();
        }
        boolean available = handleBloomFilterService.isHandleAvailable(clean);
        return HandleAvailabilityResponse.builder()
                .handle(clean)
                .available(available)
                .message(available ? "Handle @" + clean + " is available" : "Handle @" + clean + " is already taken")
                .build();
    }
}
