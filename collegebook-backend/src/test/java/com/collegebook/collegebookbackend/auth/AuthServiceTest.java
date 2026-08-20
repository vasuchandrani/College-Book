package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.bloom.HandleBloomFilterService;
import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse;
import com.collegebook.collegebookbackend.auth.dto.LoginRequest;
import com.collegebook.collegebookbackend.auth.dto.SignupRequest;
import com.collegebook.collegebookbackend.auth.entity.AppRole;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.EmailOtpRepository;
import com.collegebook.collegebookbackend.auth.repository.PasswordResetRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRoleRepository;
import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.auth.service.TokenService;
import com.collegebook.collegebookbackend.auth.service.impl.AuthServiceImpl;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.repository.CollegeRepository;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.college.repository.DepartmentRepository;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.profile.entity.Profile;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserRoleRepository userRoleRepository;
    @Mock
    private EmailOtpRepository emailOtpRepository;
    @Mock
    private PasswordResetRepository passwordResetRepository;
    @Mock
    private CollegeRepository collegeRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private HandleBloomFilterService handleBloomFilterService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private TokenService tokenService;
    @Mock
    private EmailService emailService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                userRoleRepository,
                emailOtpRepository,
                passwordResetRepository,
                collegeRepository,
                courseRepository,
                departmentRepository,
                profileRepository,
                handleBloomFilterService,
                passwordEncoder,
                jwtService,
                tokenService,
                emailService
        );
    }

    @Test
    void testSignupSuccess_WithCustomHandle() {
        UUID collegeId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        College college = new College();
        college.setId(collegeId);
        college.setName("IIT Delhi");
        college.setEmailDomains(List.of("iitd.ac.in"));

        Course course = new Course();
        course.setId(courseId);
        course.setCollege(college);
        course.setName("B.Tech CSE");

        when(userRepository.existsByEmailIgnoreCase("vatsal@iitd.ac.in")).thenReturn(false);
        when(collegeRepository.findById(collegeId)).thenReturn(Optional.of(college));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(handleBloomFilterService.isValidHandleFormat("vatsal_dev")).thenReturn(true);
        when(handleBloomFilterService.isHandleAvailable("vatsal_dev")).thenReturn(true);
        when(handleBloomFilterService.normalize("vatsal_dev")).thenReturn("vatsal_dev");
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("mockJwtToken");
        when(tokenService.createRefreshToken(any(), any(), any(), any()))
                .thenReturn(new TokenService.RefreshTokenResult("rawRefresh", UUID.randomUUID()));

        SignupRequest req = new SignupRequest();
        req.setEmail("vatsal@iitd.ac.in");
        req.setPassword("Password123!");
        req.setFullName("Vatsal Chandrani");
        req.setHandle("vatsal_dev");
        req.setCollegeId(collegeId);
        req.setCourseId(courseId);
        req.setCurrentYear(3);

        AuthResponseDto resp = authService.signup(req, "Agent", "127.0.0.1");

        assertNotNull(resp);
        assertEquals("mockJwtToken", resp.getAccessToken());

        ArgumentCaptor<Profile> profileCaptor = ArgumentCaptor.forClass(Profile.class);
        verify(profileRepository).save(profileCaptor.capture());
        Profile savedProfile = profileCaptor.getValue();
        assertEquals("vatsal_dev", savedProfile.getHandle());
        verify(handleBloomFilterService).addHandle("vatsal_dev");
    }

    @Test
    void testSignup_FailsWhenHandleTaken() {
        UUID collegeId = UUID.randomUUID();
        UUID courseId = UUID.randomUUID();

        College college = new College();
        college.setId(collegeId);
        college.setName("IIT Delhi");
        college.setEmailDomains(List.of("iitd.ac.in"));

        Course course = new Course();
        course.setId(courseId);
        course.setCollege(college);
        course.setName("B.Tech CSE");

        when(userRepository.existsByEmailIgnoreCase("vatsal@iitd.ac.in")).thenReturn(false);
        when(collegeRepository.findById(collegeId)).thenReturn(Optional.of(college));
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(handleBloomFilterService.isValidHandleFormat("taken_handle")).thenReturn(true);
        when(handleBloomFilterService.isHandleAvailable("taken_handle")).thenReturn(false);

        SignupRequest req = new SignupRequest();
        req.setEmail("vatsal@iitd.ac.in");
        req.setPassword("Password123!");
        req.setFullName("Vatsal Chandrani");
        req.setHandle("taken_handle");
        req.setCollegeId(collegeId);
        req.setCourseId(courseId);
        req.setCurrentYear(3);

        AppException ex = assertThrows(AppException.class, () -> authService.signup(req, "Agent", "127.0.0.1"));
        assertEquals(ErrorCode.HANDLE_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    void testCheckHandle_Available() {
        when(handleBloomFilterService.normalize("unique_user")).thenReturn("unique_user");
        when(handleBloomFilterService.isValidHandleFormat("unique_user")).thenReturn(true);
        when(handleBloomFilterService.isHandleAvailable("unique_user")).thenReturn(true);

        HandleAvailabilityResponse res = authService.checkHandle("unique_user");
        assertTrue(res.isAvailable());
        assertEquals("unique_user", res.getHandle());
    }

    @Test
    void testCheckHandle_Unavailable() {
        when(handleBloomFilterService.normalize("taken_user")).thenReturn("taken_user");
        when(handleBloomFilterService.isValidHandleFormat("taken_user")).thenReturn(true);
        when(handleBloomFilterService.isHandleAvailable("taken_user")).thenReturn(false);

        HandleAvailabilityResponse res = authService.checkHandle("taken_user");
        assertFalse(res.isAvailable());
    }

    @Test
    void testLogin_DynamicGuestRegistration() {
        LoginRequest req = new LoginRequest("demo@collegebook.edu", "demo123");

        College college = new College();
        UUID collegeId = UUID.randomUUID();
        college.setId(collegeId);
        college.setName("Dharmsinh Desai University - Nadiad");
        college.setSlug("dharmsinh-desai-university-nadiad");

        Course course = new Course();
        course.setId(UUID.randomUUID());
        course.setCollege(college);
        course.setName("B.Tech Information Technology");
        course.setShortName("B.Tech IT");

        when(userRepository.findByEmailIgnoreCase("demo@collegebook.edu"))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new User()));

        when(collegeRepository.findBySlug("dharmsinh-desai-university-nadiad")).thenReturn(Optional.of(college));
        when(courseRepository.findByCollegeId(collegeId)).thenReturn(List.of(course));

        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(UUID.randomUUID());
            u.setCollege(college);
            return u;
        });

        when(passwordEncoder.encode("demo123")).thenReturn("hashedDemoPassword");
        when(passwordEncoder.matches(eq("demo123"), any())).thenReturn(true);

        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("mockJwtToken");
        when(tokenService.createRefreshToken(any(), any(), any(), any()))
                .thenReturn(new TokenService.RefreshTokenResult("rawRefresh", UUID.randomUUID()));

        AuthResponseDto resp = authService.login(req, "Agent", "127.0.0.1");

        assertNotNull(resp);
        assertTrue(resp.isSuccess());

        verify(userRepository, times(2)).save(any(User.class));
        verify(profileRepository).save(any(Profile.class));
        verify(handleBloomFilterService).addHandle("demo");
    }
}
