package com.collegebook.collegebookbackend;

import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.SignupRequest;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.auth.service.AuthService;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.repository.CollegeRepository;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.profile.repository.ProfileRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class CollegebookBackendApplicationTests {

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    @AfterEach
    void cleanupTestUsers() {
        // Clean up all integration test users from the database
        try {
            jdbcTemplate.update("DELETE FROM users WHERE email LIKE 'test_integration_%' OR email LIKE '%@example.com'");
            System.out.println("DEBUG: Cleaned up integration test users from database.");
        } catch (Exception e) {
            System.err.println("DEBUG: Cleanup warning: " + e.getMessage());
        }
    }

    @Test
    void testSignupIntegration() {
        List<College> colleges = collegeRepository.findAll();
        assertNotNull(colleges);
        College ddu = colleges.stream()
                .filter(c -> c.getSlug().contains("dharmsinh"))
                .findFirst()
                .orElse(colleges.get(0));

        List<Course> courses = courseRepository.findByCollegeId(ddu.getId());
        assertNotNull(courses);
        Course course = courses.get(0);

        String testUserEmail = "test_integration_" + System.currentTimeMillis() + "@" + ddu.getEmailDomains().get(0);

        SignupRequest req = new SignupRequest();
        req.setEmail(testUserEmail);
        req.setPassword("Password123!");
        req.setFullName("Integration Test User");
        req.setCollegeId(ddu.getId());
        req.setCourseId(course.getId());
        req.setCurrentYear(1);
        req.setGender("MALE");

        System.out.println("DEBUG: Attempting integration signup for email: " + req.getEmail());
        AuthResponseDto response = authService.signup(req, "JUnit Agent", "127.0.0.1");
        assertNotNull(response);
        System.out.println("DEBUG: Signup integration test succeeded!");
    }
}
