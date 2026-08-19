package com.collegebook.collegebookbackend.auth.service;

import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse;
import com.collegebook.collegebookbackend.auth.dto.LoginRequest;
import com.collegebook.collegebookbackend.auth.dto.LogoutRequest;
import com.collegebook.collegebookbackend.auth.dto.PasswordResetRequest;
import com.collegebook.collegebookbackend.auth.dto.RefreshTokenRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpResponse;
import com.collegebook.collegebookbackend.auth.dto.SignupRequest;
import com.collegebook.collegebookbackend.auth.dto.UserDto;
import com.collegebook.collegebookbackend.auth.dto.VerifyOtpRequest;

import java.util.UUID;

public interface AuthService {
    SendOtpResponse sendOtp(SendOtpRequest request);
    boolean verifyOtp(VerifyOtpRequest request);
    AuthResponseDto signup(SignupRequest request, String userAgent, String ip);
    AuthResponseDto login(LoginRequest request, String userAgent, String ip);
    AuthResponseDto refresh(RefreshTokenRequest request, String userAgent, String ip);
    void logout(LogoutRequest request);
    UserDto getMe(UUID userId);
    HandleAvailabilityResponse checkHandle(String handle);
    void forgotPassword(String email);
    void resetPassword(PasswordResetRequest request);
    void sendPasswordChangeOtp(UUID userId);
    void changePasswordWithOtp(UUID userId, com.collegebook.collegebookbackend.auth.dto.ChangePasswordOtpRequest request);
}
