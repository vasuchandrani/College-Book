package com.collegebook.collegebookbackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupStartResponse {
    private String signupToken;
    private String maskedEmail;
    private long expiresInSeconds;
}
