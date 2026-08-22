package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupStartRequest {

    @NotNull(message = "College ID is required")
    private UUID collegeId;

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;
}
