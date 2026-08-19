package com.collegebook.collegebookbackend.auth.dto;

public class SignupVerifyOtpResponse {
    private String signupToken;

    public SignupVerifyOtpResponse() {
    }

    public SignupVerifyOtpResponse(String signupToken) {
        this.signupToken = signupToken;
    }

    public String getSignupToken() {
        return signupToken;
    }

    public void setSignupToken(String signupToken) {
        this.signupToken = signupToken;
    }
}
