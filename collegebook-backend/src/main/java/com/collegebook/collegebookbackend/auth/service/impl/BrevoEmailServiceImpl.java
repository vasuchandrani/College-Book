package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.service.EmailService;
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

@Service
public class BrevoEmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailServiceImpl.class);

    @Value("${brevo.api-key:YOUR_BREVO_API_KEY}")
    private String apiKey;

    @Value("${brevo.sender-email:collegebook.team@gmail.com}")
    private String senderEmail;

    @Value("${brevo.sender-name:CollegeBook}")
    private String senderName;

    @Value("${app.frontend-url:http://localhost:8081}")
    private String frontendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0; padding:0; background-color:#f4f6f9; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                "  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding: 30px 15px;'>" +
                "    <tr><td align='center'>" +
                "      <table role='presentation' width='100%' style='max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>" +
                "        <tr><td style='background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 28px 32px; text-align: center;'>" +
                "          <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>CollegeBook</h1>" +
                "          <p style='margin: 4px 0 0 0; color: #e0e7ff; font-size: 13px;'>Exclusive Campus Network</p>" +
                "        </td></tr>" +
                "        <tr><td style='padding: 32px 32px 24px 32px; color: #1e293b;'>" +
                "          <h2 style='margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;'>Verify Your College Email</h2>" +
                "          <p style='margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #475569;'>Use the 6-digit verification code below to complete your registration or campus sign-in:</p>" +
                "          <div style='background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;'>" +
                "            <span style='font-family: \"Courier New\", Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; display: inline-block; padding-left: 10px;'>" + otpCode + "</span>" +
                "          </div>" +
                "          <p style='margin: 0 0 20px 0; font-size: 13px; color: #64748b; text-align: center;'>⏱️ This verification code is valid for <b>10 minutes</b>.</p>" +
                "          <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;' />" +
                "          <p style='margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;'>If you did not request this verification code, please ignore this email or contact support if you have concerns.</p>" +
                "        </td></tr>" +
                "        <tr><td style='background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;'>" +
                "          © 2026 CollegeBook Inc. • Campus Verification System" +
                "        </td></tr>" +
                "      </table>" +
                "    </td></tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

        sendEmail(toEmail, "CollegeBook - Email Verification Code (" + otpCode + ")", htmlContent);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        String base = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl : "http://localhost:8081";
        String resetUrl = base.replaceAll("/+$", "") + "/reset-password?token=" + resetToken;
        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0; padding:0; background-color:#f4f6f9; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                "  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding: 30px 15px;'>" +
                "    <tr><td align='center'>" +
                "      <table role='presentation' width='100%' style='max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>" +
                "        <tr><td style='background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%); padding: 28px 32px; text-align: center;'>" +
                "          <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>CollegeBook</h1>" +
                "          <p style='margin: 4px 0 0 0; color: #e0f2fe; font-size: 13px;'>Account Security</p>" +
                "        </td></tr>" +
                "        <tr><td style='padding: 32px 32px 24px 32px; color: #1e293b;'>" +
                "          <h2 style='margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;'>Password Reset Request</h2>" +
                "          <p style='margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #475569;'>We received a request to reset your password. Click the button below to set a new password:</p>" +
                "          <div style='text-align: center; margin: 24px 0;'>" +
                "            <a href='" + resetUrl + "' style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: 600; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);'>Reset My Password</a>" +
                "          </div>" +
                "          <p style='margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-align: center;'>Or copy and paste your reset token in the app:</p>" +
                "          <div style='background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; word-break: break-all; font-family: monospace; font-size: 13px; color: #0369a1; text-align: center; margin-bottom: 24px;'>" +
                "            " + resetToken +
                "          </div>" +
                "          <p style='margin: 0 0 20px 0; font-size: 13px; color: #64748b; text-align: center;'>⏱️ This link & token will expire in <b>1 hour</b>.</p>" +
                "          <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;' />" +
                "          <p style='margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;'>If you did not request a password reset, your account is safe and you can ignore this email.</p>" +
                "        </td></tr>" +
                "        <tr><td style='background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;'>" +
                "          © 2026 CollegeBook Inc. • Security System" +
                "        </td></tr>" +
                "      </table>" +
                "    </td></tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

        sendEmail(toEmail, "CollegeBook - Password Reset Request", htmlContent);
    }

    @Override
    public void sendPasswordChangeOtpEmail(String toEmail, String otpCode) {
        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0; padding:0; background-color:#f4f6f9; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                "  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding: 30px 15px;'>" +
                "    <tr><td align='center'>" +
                "      <table role='presentation' width='100%' style='max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>" +
                "        <tr><td style='background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); padding: 28px 32px; text-align: center;'>" +
                "          <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>CollegeBook</h1>" +
                "          <p style='margin: 4px 0 0 0; color: #ffe4e6; font-size: 13px;'>Account Security • Password Change</p>" +
                "        </td></tr>" +
                "        <tr><td style='padding: 32px 32px 24px 32px; color: #1e293b;'>" +
                "          <h2 style='margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;'>Password Change Verification</h2>" +
                "          <p style='margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #475569;'>You requested to change your CollegeBook password. Enter the 6-digit verification code below to authorize this change:</p>" +
                "          <div style='background-color: #fff1f2; border: 2px dashed #fecdd3; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;'>" +
                "            <span style='font-family: \"Courier New\", Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #e11d48; display: inline-block; padding-left: 10px;'>" + otpCode + "</span>" +
                "          </div>" +
                "          <p style='margin: 0 0 20px 0; font-size: 13px; color: #64748b; text-align: center;'>⏱️ This code will expire in <b>10 minutes</b>.</p>" +
                "          <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;' />" +
                "          <p style='margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;'>⚠️ If you did NOT request this change, please change your credentials immediately or contact campus support.</p>" +
                "        </td></tr>" +
                "        <tr><td style='background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;'>" +
                "          © 2026 CollegeBook Inc. • Security Verification" +
                "        </td></tr>" +
                "      </table>" +
                "    </td></tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

        sendEmail(toEmail, "CollegeBook - Password Change Code (" + otpCode + ")", htmlContent);
    }

    @Override
    public void sendMemoryBookOtpEmail(String toEmail, String otpCode) {
        String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='margin:0; padding:0; background-color:#f4f6f9; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                "  <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='padding: 30px 15px;'>" +
                "    <tr><td align='center'>" +
                "      <table role='presentation' width='100%' style='max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);'>" +
                "        <tr><td style='background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 28px 32px; text-align: center;'>" +
                "          <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;'>CollegeBook</h1>" +
                "          <p style='margin: 4px 0 0 0; color: #d1fae5; font-size: 13px;'>Campus Memory Book Backup</p>" +
                "        </td></tr>" +
                "        <tr><td style='padding: 32px 32px 24px 32px; color: #1e293b;'>" +
                "          <h2 style='margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0f172a;'>Verify Memory Book Delivery Email</h2>" +
                "          <p style='margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #475569;'>This email address is being registered to receive your personal digital Memory Book if your CollegeBook account is ever closed or deleted. Enter the 6-digit code below to confirm this address:</p>" +
                "          <div style='background-color: #ecfdf5; border: 2px dashed #a7f3d0; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;'>" +
                "            <span style='font-family: \"Courier New\", Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #059669; display: inline-block; padding-left: 10px;'>" + otpCode + "</span>" +
                "          </div>" +
                "          <p style='margin: 0 0 20px 0; font-size: 13px; color: #64748b; text-align: center;'>⏱️ This code will expire in <b>10 minutes</b>.</p>" +
                "          <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;' />" +
                "          <p style='margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.4;'>If you did not request to set this email as your memory book destination, no action is needed.</p>" +
                "        </td></tr>" +
                "        <tr><td style='background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;'>" +
                "          © 2026 CollegeBook Inc. • Memory Book Protection" +
                "        </td></tr>" +
                "      </table>" +
                "    </td></tr>" +
                "  </table>" +
                "</body>" +
                "</html>";

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
