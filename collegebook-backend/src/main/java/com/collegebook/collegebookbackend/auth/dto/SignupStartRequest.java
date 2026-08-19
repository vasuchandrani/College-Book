package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class SignupStartRequest {
    @NotNull(message = "College ID is required")
    private UUID collegeId;

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    public SignupStartRequest() {
    }

    public SignupStartRequest(UUID collegeId, String email) {
        this.collegeId = collegeId;
        this.email = email;
    }

    public UUID getCollegeId() {
        return collegeId;
    }

    public void setCollegeId(UUID collegeId) {
        this.collegeId = collegeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
