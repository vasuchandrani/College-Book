package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.service.EmailService;
import com.collegebook.collegebookbackend.auth.service.EmailTemplates;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sesv2.SesV2Client;
import software.amazon.awssdk.services.sesv2.model.Body;
import software.amazon.awssdk.services.sesv2.model.Content;
import software.amazon.awssdk.services.sesv2.model.Destination;
import software.amazon.awssdk.services.sesv2.model.EmailContent;
import software.amazon.awssdk.services.sesv2.model.Message;
import software.amazon.awssdk.services.sesv2.model.SendEmailRequest;
import software.amazon.awssdk.services.sesv2.model.SendEmailResponse;

/**
 * AWS Simple Email Service (SES v2) implementation of EmailService.
 */
@Slf4j
@Service("awsSesEmailService")
public class AwsSesEmailServiceImpl implements EmailService {

    private final SesV2Client sesClient;

    @Value("${aws.ses.sender-email:${brevo.sender-email:collegebook.team@gmail.com}}")
    private String senderEmail;

    @Value("${aws.ses.sender-name:${brevo.sender-name:CollegeBook}}")
    private String senderName;

    @Value("${app.frontend-url:http://localhost:5000}")
    private String frontendUrl;

    public AwsSesEmailServiceImpl(@Autowired(required = false) SesV2Client sesClient) {
        this.sesClient = sesClient;
    }

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
        if (sesClient == null) {
            log.warn("AWS SES client is not initialized. Email to {} was skipped.", toEmail);
            return;
        }

        try {
            String from = (senderName != null && !senderName.isBlank())
                    ? String.format("%s <%s>", senderName, senderEmail)
                    : senderEmail;

            Destination destination = Destination.builder()
                    .toAddresses(toEmail)
                    .build();

            Content sub = Content.builder().data(subject).charset("UTF-8").build();
            Body body = Body.builder()
                    .html(Content.builder().data(htmlContent).charset("UTF-8").build())
                    .build();

            Message message = Message.builder()
                    .subject(sub)
                    .body(body)
                    .build();

            EmailContent emailContent = EmailContent.builder()
                    .simple(message)
                    .build();

            SendEmailRequest request = SendEmailRequest.builder()
                    .fromEmailAddress(from)
                    .destination(destination)
                    .content(emailContent)
                    .build();

            SendEmailResponse response = sesClient.sendEmail(request);
            log.info("Sent email successfully via AWS SES to {}. MessageId: {}", toEmail, response.messageId());
        } catch (Exception e) {
            log.error("Failed to send email via AWS SES to {}: {}", toEmail, e.getMessage());
            throw new AppException(
                    ErrorCode.EMAIL_DELIVERY_FAILED,
                    "Unable to deliver verification email via AWS SES. Please try again shortly."
            );
        }
    }
}
