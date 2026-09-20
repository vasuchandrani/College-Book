package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.auth.service.impl.DelegatingEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
public class DelegatingEmailServiceTest {

    @Mock
    private EmailService brevoEmailService;

    @Mock
    private EmailService awsSesEmailService;

    private DelegatingEmailService delegatingEmailService;

    @BeforeEach
    void setUp() {
        delegatingEmailService = new DelegatingEmailService(brevoEmailService, awsSesEmailService);
    }

    @Test
    void testRoutesToBrevoByDefault() {
        ReflectionTestUtils.setField(delegatingEmailService, "activeProvider", "BREVO");

        delegatingEmailService.sendOtpEmail("test@example.com", "123456");
        verify(brevoEmailService).sendOtpEmail("test@example.com", "123456");
        verifyNoInteractions(awsSesEmailService);

        delegatingEmailService.sendPasswordResetEmail("test@example.com", "token-123");
        verify(brevoEmailService).sendPasswordResetEmail("test@example.com", "token-123");

        delegatingEmailService.sendPasswordChangeOtpEmail("test@example.com", "654321");
        verify(brevoEmailService).sendPasswordChangeOtpEmail("test@example.com", "654321");

        delegatingEmailService.sendMemoryBookOtpEmail("test@example.com", "999888");
        verify(brevoEmailService).sendMemoryBookOtpEmail("test@example.com", "999888");
    }

    @Test
    void testRoutesToAwsSesWhenActiveProviderIsSes() {
        ReflectionTestUtils.setField(delegatingEmailService, "activeProvider", "SES");

        delegatingEmailService.sendOtpEmail("test@example.com", "123456");
        verify(awsSesEmailService).sendOtpEmail("test@example.com", "123456");
        verifyNoInteractions(brevoEmailService);

        delegatingEmailService.sendPasswordResetEmail("test@example.com", "token-123");
        verify(awsSesEmailService).sendPasswordResetEmail("test@example.com", "token-123");

        delegatingEmailService.sendPasswordChangeOtpEmail("test@example.com", "654321");
        verify(awsSesEmailService).sendPasswordChangeOtpEmail("test@example.com", "654321");

        delegatingEmailService.sendMemoryBookOtpEmail("test@example.com", "999888");
        verify(awsSesEmailService).sendMemoryBookOtpEmail("test@example.com", "999888");
    }

    @Test
    void testRoutesToAwsSesWhenActiveProviderIsAwsSes() {
        ReflectionTestUtils.setField(delegatingEmailService, "activeProvider", "AWS_SES");

        delegatingEmailService.sendOtpEmail("test@example.com", "112233");
        verify(awsSesEmailService).sendOtpEmail("test@example.com", "112233");
        verifyNoInteractions(brevoEmailService);
    }
}
