package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class SignupVerifyOtpRequest {
    @NotBlank(message = "Signup token is required")
    private String signupToken;

    @NotBlank(message = "Verification code is required")
    private String code;

    public SignupVerifyOtpRequest() {
    }

    public SignupVerifyOtpRequest(String signupToken, String code) {
        this.signupToken = signupToken;
        this.code = code;
    }

    public String getSignupToken() {
        return signupToken;
    }

    public void setSignupToken(String signupToken) {
        this.signupToken = signupToken;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
