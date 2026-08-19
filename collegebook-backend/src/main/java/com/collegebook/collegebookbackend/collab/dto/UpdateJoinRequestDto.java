package com.collegebook.collegebookbackend.collab.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateJoinRequestDto {

    @NotBlank(message = "Role cannot be blank")
    private String role;

    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    public UpdateJoinRequestDto() {
    }

    public UpdateJoinRequestDto(String role, String message) {
        this.role = role;
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
