package com.collegebook.collegebookbackend.profile;

import com.collegebook.collegebookbackend.auth.entity.EmailOtp;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.EmailOtpRepository;
import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.profile.dto.ProfileDto;
import com.collegebook.collegebookbackend.profile.dto.ProfileUpdateDto;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import com.collegebook.collegebookbackend.profile.service.impl.ProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private EmailOtpRepository emailOtpRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private com.collegebook.collegebookbackend.storage.service.StorageService storageService;

    private ProfileServiceImpl profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileServiceImpl(profileRepository, emailOtpRepository, emailService, storageService);
    }

    @Test
    void testGetMyProfileSuccess() {
        UUID userId = UUID.randomUUID();
        Profile p = new Profile();
        p.setUserId(userId);
        p.setFullName("Vatsal Chandrani");
        p.setHandle("vatsal_c");
        p.setInitials("VC");

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(p));

        ProfileDto dto = profileService.getMyProfile(userId);

        assertNotNull(dto);
        assertEquals("Vatsal Chandrani", dto.getFullName());
        assertEquals("vatsal_c", dto.getHandle());
    }

    @Test
    void testGetStudentBySlugSuccess() {
        Profile p = new Profile();
        p.setUserId(UUID.randomUUID());
        p.setFullName("Rahul Sharma");
        p.setHandle("rahul_s");

        User u = new User();
        College c = new College();
        c.setName("IIT Bombay");
        u.setCollege(c);
        p.setUser(u);

        Course crs = new Course();
        crs.setName("B.Tech CSE");
        p.setCourse(crs);

        when(profileRepository.findByHandleIgnoreCase("rahul_s")).thenReturn(Optional.of(p));

        PublicProfileDto dto = profileService.getStudentBySlug("rahul_s");

        assertNotNull(dto);
        assertEquals("Rahul Sharma", dto.getFullName());
        assertEquals("IIT Bombay", dto.getCollegeName());
    }

    @Test
    void testGetStudentBySlugNotFound() {
        when(profileRepository.findByHandleIgnoreCase("unknown_handle")).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> profileService.getStudentBySlug("unknown_handle"));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void testSendMemoryBookEmailOtpSuccess() {
        UUID userId = UUID.randomUUID();
        Profile p = new Profile();
        p.setUserId(userId);

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(p));

        profileService.sendMemoryBookEmailOtp(userId, "personal@example.com");

        verify(emailOtpRepository).save(any(EmailOtp.class));
    }

    @Test
    void testVerifyAndSetMemoryBookEmailSuccess() {
        UUID userId = UUID.randomUUID();
        Profile p = new Profile();
        p.setUserId(userId);

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(p));

        String rawOtp = "123456";
        String otpHash;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            otpHash = HexFormat.of().formatHex(digest.digest(rawOtp.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        EmailOtp otp = new EmailOtp();
        otp.setEmail("personal@example.com");
        otp.setOtpHash(otpHash);
        otp.setPurpose("MEMORY_BOOK_EMAIL_VERIFY");
        otp.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        otp.setConsumedAt(null);

        when(emailOtpRepository.findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc("personal@example.com", "MEMORY_BOOK_EMAIL_VERIFY"))
                .thenReturn(Optional.of(otp));

        ProfileDto dto = profileService.verifyAndSetMemoryBookEmail(userId, "personal@example.com", "123456");

        assertNotNull(dto);
        assertEquals("personal@example.com", dto.getMemoryBookEmail());
        verify(profileRepository).save(p);
    }

    @Test
    void testRemoveMemoryBookEmailSuccess() {
        UUID userId = UUID.randomUUID();
        Profile p = new Profile();
        p.setUserId(userId);
        p.setMemoryBookEmail("personal@example.com");

        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(p));

        ProfileDto dto = profileService.removeMemoryBookEmail(userId);

        assertNotNull(dto);
        assertNull(dto.getMemoryBookEmail());
        verify(profileRepository).save(p);
    }
}
