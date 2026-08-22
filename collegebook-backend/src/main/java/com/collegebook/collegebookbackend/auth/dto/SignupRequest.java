package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Full name cannot be blank")
    private String fullName;

    @NotBlank(message = "Username/handle cannot be blank")
    @Size(min = 3, max = 30, message = "Handle must be between 3 and 30 characters")
    private String handle;

    private UUID collegeId;
    private UUID courseId;
    private UUID departmentId;

    @Builder.Default
    private Integer currentYear = 1;

    private String gender;
}
