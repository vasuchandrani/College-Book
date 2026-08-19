package com.collegebook.collegebookbackend.auth.dto;

public class SignupStartResponse {
    private String signupToken;
    private String maskedEmail;
    private long expiresInSeconds;

    public SignupStartResponse() {
    }

    public SignupStartResponse(String signupToken, String maskedEmail, long expiresInSeconds) {
        this.signupToken = signupToken;
        this.maskedEmail = maskedEmail;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getSignupToken() {
        return signupToken;
    }

    public void setSignupToken(String signupToken) {
        this.signupToken = signupToken;
    }

    public String getMaskedEmail() {
        return maskedEmail;
    }

    public void setMaskedEmail(String maskedEmail) {
        this.maskedEmail = maskedEmail;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }
}
