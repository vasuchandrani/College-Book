package com.collegebook.collegebookbackend.auth.controller;

import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.ForgotPasswordRequest;
import com.collegebook.collegebookbackend.auth.dto.LoginRequest;
import com.collegebook.collegebookbackend.auth.dto.LogoutRequest;
import com.collegebook.collegebookbackend.auth.dto.PasswordResetRequest;
import com.collegebook.collegebookbackend.auth.dto.RefreshTokenRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpRequest;
import com.collegebook.collegebookbackend.auth.dto.SignupRequest;
import com.collegebook.collegebookbackend.auth.dto.UserDto;
import com.collegebook.collegebookbackend.auth.dto.VerifyOtpRequest;
import com.collegebook.collegebookbackend.auth.service.AuthService;
import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/otp/send")
    public ResponseEntity<com.collegebook.collegebookbackend.auth.dto.SendOtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        com.collegebook.collegebookbackend.auth.dto.SendOtpResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<Map<String, Boolean>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean verified = authService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("verified", verified));
    }

    @GetMapping("/check-handle")
    public ResponseEntity<com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse> checkHandle(
            @RequestParam("handle") String handle) {
        return ResponseEntity.ok(authService.checkHandle(handle));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest httpRequest) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.signup(request, userAgent, ip));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.login(request, userAgent, ip));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDto> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ip = httpRequest.getRemoteAddr();
        return ResponseEntity.ok(authService.refresh(request, userAgent, ip));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(authService.getMe(currentUser.getId()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody(required = false) ForgotPasswordRequest body,
            @RequestParam(value = "email", required = false) String emailParam) {
        String email = (body != null && body.getEmail() != null && !body.getEmail().isBlank())
                ? body.getEmail()
                : emailParam;
        if (email != null && !email.isBlank()) {
            authService.forgotPassword(email.trim());
        }
        return ResponseEntity.ok(Map.of("message", "Password reset email sent if account exists"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @PostMapping("/password/change-otp/send")
    public ResponseEntity<Map<String, String>> sendPasswordChangeOtp(@CurrentUser UserPrincipal currentUser) {
        authService.sendPasswordChangeOtp(currentUser.getId());
        return ResponseEntity.ok(Map.of("message", "Password change verification code sent to your email"));
    }

    @PostMapping("/password/change-with-otp")
    public ResponseEntity<Map<String, String>> changePasswordWithOtp(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody com.collegebook.collegebookbackend.auth.dto.ChangePasswordOtpRequest request) {
        authService.changePasswordWithOtp(currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
