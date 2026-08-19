package com.collegebook.collegebookbackend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "9a8f7e6d5c4b3a210987654321fedcba9a8f7e6d5c4b3a210987654321fedcba");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    void testGenerateAndValidateTokenSuccess() {
        UUID userId = UUID.randomUUID();
        UUID collegeId = UUID.randomUUID();
        List<String> roles = List.of("STUDENT");

        String token = jwtService.generateAccessToken(userId, collegeId, roles);

        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));
        assertEquals(userId.toString(), jwtService.extractUserId(token));
        assertEquals(collegeId.toString(), jwtService.extractCollegeId(token));
        assertEquals(roles, jwtService.extractRoles(token));
    }

    @Test
    void testValidateInvalidTokenFails() {
        assertFalse(jwtService.validateToken("invalid.token.here"));
        assertFalse(jwtService.validateToken(""));
        assertFalse(jwtService.validateToken(null));
    }
}
