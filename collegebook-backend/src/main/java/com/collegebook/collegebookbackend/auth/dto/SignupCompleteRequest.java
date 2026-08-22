package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;
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
public class SignupCompleteRequest {

    @NotBlank(message = "Session ID is required")
    private String sessionId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "College ID is required")
    private UUID collegeId;

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    private UUID departmentId;

    @NotNull(message = "Current year is required")
    private Integer currentYear;

    private String gender;
}
