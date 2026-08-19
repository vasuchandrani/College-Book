package com.collegebook.collegebookbackend.college.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollegeRequestDto {

    private UUID id;

    @NotBlank(message = "College name is required")
    private String collegeName;

    private String city;

    private String state;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid college or student email")
    private String requesterEmail;

    private String requesterName;

    private String status;

    private String notes;

    private Instant createdAt;
}
