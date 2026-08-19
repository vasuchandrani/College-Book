package com.collegebook.collegebookbackend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {

    @Builder.Default
    private boolean success = true;
    private String message;
    private String code;
    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserDto user;

    public AuthResponseDto(String accessToken, String refreshToken, UserDto user) {
        this.success = true;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public static AuthResponseDto failure(String code, String message) {
        AuthResponseDto dto = new AuthResponseDto();
        dto.setSuccess(false);
        dto.setCode(code);
        dto.setMessage(message);
        return dto;
    }
}

