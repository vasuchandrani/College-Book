package com.collegebook.collegebookbackend.auth.service;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otpCode);
    void sendPasswordResetEmail(String toEmail, String resetToken);
    void sendPasswordChangeOtpEmail(String toEmail, String otpCode);
    void sendMemoryBookOtpEmail(String toEmail, String otpCode);
}
