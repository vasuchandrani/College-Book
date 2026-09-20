package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.auth.service.EmailTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service("brevoEmailService")
public class BrevoEmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailServiceImpl.class);

    @Value("${brevo.api-key:YOUR_BREVO_API_KEY}")
    private String apiKey;

    @Value("${brevo.sender-email:collegebook.team@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender-name:CollegeBook}")
    private String senderName;

    @Value("${app.frontend-url:http://localhost:5000}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        String htmlContent = EmailTemplates.buildOtpEmailHtml(otpCode);
        sendEmail(toEmail, "CollegeBook - Email Verification Code (" + otpCode + ")", htmlContent);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String htmlContent = EmailTemplates.buildPasswordResetEmailHtml(frontendUrl, resetToken);
        sendEmail(toEmail, "CollegeBook - Password Reset Request", htmlContent);
    }

    @Override
    public void sendPasswordChangeOtpEmail(String toEmail, String otpCode) {
        String htmlContent = EmailTemplates.buildPasswordChangeOtpEmailHtml(otpCode);
        sendEmail(toEmail, "CollegeBook - Password Change Code (" + otpCode + ")", htmlContent);
    }

    @Override
    public void sendMemoryBookOtpEmail(String toEmail, String otpCode) {
        String htmlContent = EmailTemplates.buildMemoryBookOtpEmailHtml(otpCode);
        sendEmail(toEmail, "CollegeBook - Memory Book Email Verification (" + otpCode + ")", htmlContent);
    }

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Brevo API key is not configured. Email to {} was skipped.", toEmail);
            return;
        }

        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            Map<String, Object> body = Map.of(
                    "sender", Map.of("email", senderEmail, "name", senderName),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "htmlContent", htmlContent
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(url, request, String.class);
            log.info("Sent email successfully to {}", toEmail);
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Brevo API returned status {} for {}: {}", e.getStatusCode(), toEmail, e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 402 || e.getStatusCode().value() == 429) {
                throw new com.collegebook.collegebookbackend.common.AppException(
                        com.collegebook.collegebookbackend.common.ErrorCode.EMAIL_DELIVERY_FAILED,
                        "Email service limit reached. Please try again in a few minutes."
                );
            }
            throw new com.collegebook.collegebookbackend.common.AppException(
                    com.collegebook.collegebookbackend.common.ErrorCode.EMAIL_DELIVERY_FAILED,
                    "Unable to deliver verification email. Please check the address and try again."
            );
        } catch (Exception e) {
            log.error("Failed to send email via Brevo to {}: {}", toEmail, e.getMessage());
            throw new com.collegebook.collegebookbackend.common.AppException(
                    com.collegebook.collegebookbackend.common.ErrorCode.EMAIL_DELIVERY_FAILED,
                    "Unable to deliver verification email. Please try again shortly."
            );
        }
    }
}
