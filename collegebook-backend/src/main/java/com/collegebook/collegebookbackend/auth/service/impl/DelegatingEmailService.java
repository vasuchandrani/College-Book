package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * Primary EmailService orchestrator that routes email sending to the active provider
 * (BREVO or SES) based on the EMAIL_ACTIVE_PROVIDER environment variable / configuration.
 */
@Slf4j
@Primary
@Service
public class DelegatingEmailService implements EmailService {

    private final EmailService brevoEmailService;
    private final EmailService awsSesEmailService;

    @Value("${email.active-provider:${EMAIL_ACTIVE_PROVIDER:BREVO}}")
    private String activeProvider;

    public DelegatingEmailService(
            @Qualifier("brevoEmailService") EmailService brevoEmailService,
            @Qualifier("awsSesEmailService") EmailService awsSesEmailService
    ) {
        this.brevoEmailService = brevoEmailService;
        this.awsSesEmailService = awsSesEmailService;
    }

    private EmailService getActiveService() {
        if ("SES".equalsIgnoreCase(activeProvider) || "AWS_SES".equalsIgnoreCase(activeProvider) || "AWS".equalsIgnoreCase(activeProvider)) {
            return awsSesEmailService;
        }
        return brevoEmailService;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.debug("Routing sendOtpEmail to provider: {}", activeProvider);
        getActiveService().sendOtpEmail(toEmail, otpCode);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        log.debug("Routing sendPasswordResetEmail to provider: {}", activeProvider);
        getActiveService().sendPasswordResetEmail(toEmail, resetToken);
    }

    @Override
    public void sendPasswordChangeOtpEmail(String toEmail, String otpCode) {
        log.debug("Routing sendPasswordChangeOtpEmail to provider: {}", activeProvider);
        getActiveService().sendPasswordChangeOtpEmail(toEmail, otpCode);
    }

    @Override
    public void sendMemoryBookOtpEmail(String toEmail, String otpCode) {
        log.debug("Routing sendMemoryBookOtpEmail to provider: {}", activeProvider);
        getActiveService().sendMemoryBookOtpEmail(toEmail, otpCode);
    }
}
