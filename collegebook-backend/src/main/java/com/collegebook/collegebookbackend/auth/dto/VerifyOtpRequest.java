package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP code cannot be blank")
    @Size(min = 6, max = 6, message = "OTP code must be 6 digits")
    private String code;

    @NotBlank(message = "Purpose is required")
    @Builder.Default
    private String purpose = "SIGNUP";
}
