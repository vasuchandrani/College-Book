package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.service.impl.BrevoEmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BrevoEmailServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private BrevoEmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new BrevoEmailServiceImpl();
        ReflectionTestUtils.setField(emailService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(emailService, "senderEmail", "collegebook.team@gmail.com");
        ReflectionTestUtils.setField(emailService, "senderName", "CollegeBook");
        ReflectionTestUtils.setField(emailService, "restTemplate", restTemplate);
    }

    @Test
    void testSendOtpEmailSuccess() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        assertDoesNotThrow(() -> emailService.sendOtpEmail("student@ddu.ac.in", "123456"));
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testSendPasswordResetEmailSuccess() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail("student@ddu.ac.in", "reset-token-123"));
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testSendPasswordChangeOtpEmailSuccess() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        assertDoesNotThrow(() -> emailService.sendPasswordChangeOtpEmail("student@ddu.ac.in", "654321"));
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void testSendMemoryBookOtpEmailSuccess() {
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(ResponseEntity.ok("success"));

        assertDoesNotThrow(() -> emailService.sendMemoryBookOtpEmail("personal@example.com", "999888"));
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(String.class));
    }
}
