package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.service.impl.AwsSesEmailServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;
import software.amazon.awssdk.services.sesv2.model.SendEmailResponse;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AwsSesEmailServiceTest {

    @Mock
    private SesV2Client sesClient;

    private AwsSesEmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        emailService = new AwsSesEmailServiceImpl(sesClient);
        ReflectionTestUtils.setField(emailService, "senderEmail", "collegebook.team@gmail.com");
        ReflectionTestUtils.setField(emailService, "senderName", "CollegeBook");
        ReflectionTestUtils.setField(emailService, "frontendUrl", "https://collegebook.live");
    }

    @Test
    void testSendOtpEmailSuccess() {
        when(sesClient.sendEmail(any(SendEmailRequest.class)))
                .thenReturn(SendEmailResponse.builder().messageId("ses-msg-123").build());

        assertDoesNotThrow(() -> emailService.sendOtpEmail("student@ddu.ac.in", "123456"));

        ArgumentCaptor<SendEmailRequest> captor = ArgumentCaptor.forClass(SendEmailRequest.class);
        verify(sesClient).sendEmail(captor.capture());

        SendEmailRequest captured = captor.getValue();
        assertEquals("CollegeBook <collegebook.team@gmail.com>", captured.fromEmailAddress());
        assertTrue(captured.destination().toAddresses().contains("student@ddu.ac.in"));
        assertTrue(captured.content().simple().subject().data().contains("123456"));
    }

    @Test
    void testSendPasswordResetEmailSuccess() {
        when(sesClient.sendEmail(any(SendEmailRequest.class)))
                .thenReturn(SendEmailResponse.builder().messageId("ses-msg-456").build());

        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail("student@ddu.ac.in", "reset-token-123"));

        ArgumentCaptor<SendEmailRequest> captor = ArgumentCaptor.forClass(SendEmailRequest.class);
        verify(sesClient).sendEmail(captor.capture());

        SendEmailRequest captured = captor.getValue();
        assertTrue(captured.destination().toAddresses().contains("student@ddu.ac.in"));
        assertTrue(captured.content().simple().body().html().data().contains("reset-password?token=reset-token-123"));
    }

    @Test
    void testSendPasswordChangeOtpEmailSuccess() {
        when(sesClient.sendEmail(any(SendEmailRequest.class)))
                .thenReturn(SendEmailResponse.builder().messageId("ses-msg-789").build());

        assertDoesNotThrow(() -> emailService.sendPasswordChangeOtpEmail("student@ddu.ac.in", "654321"));

        ArgumentCaptor<SendEmailRequest> captor = ArgumentCaptor.forClass(SendEmailRequest.class);
        verify(sesClient).sendEmail(captor.capture());

        SendEmailRequest captured = captor.getValue();
        assertTrue(captured.destination().toAddresses().contains("student@ddu.ac.in"));
        assertTrue(captured.content().simple().body().html().data().contains("654321"));
    }

    @Test
    void testSendMemoryBookOtpEmailSuccess() {
        when(sesClient.sendEmail(any(SendEmailRequest.class)))
                .thenReturn(SendEmailResponse.builder().messageId("ses-msg-101").build());

        assertDoesNotThrow(() -> emailService.sendMemoryBookOtpEmail("personal@example.com", "999888"));

        ArgumentCaptor<SendEmailRequest> captor = ArgumentCaptor.forClass(SendEmailRequest.class);
        verify(sesClient).sendEmail(captor.capture());

        SendEmailRequest captured = captor.getValue();
        assertTrue(captured.destination().toAddresses().contains("personal@example.com"));
        assertTrue(captured.content().simple().body().html().data().contains("999888"));
    }
}
