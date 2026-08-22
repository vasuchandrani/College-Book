package com.collegebook.collegebookbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupVerifyOtpRequest {

    @NotBlank(message = "Signup token is required")
    private String signupToken;

    @NotBlank(message = "Verification code is required")
    private String code;
}
