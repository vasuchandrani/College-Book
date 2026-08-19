package com.collegebook.collegebookbackend.auth.service;

import com.collegebook.collegebookbackend.auth.entity.User;

import java.util.UUID;

public interface TokenService {

    record RefreshTokenResult(String rawToken, UUID tokenId) {}
    record AuthResponse(String accessToken, String refreshToken) {}

    RefreshTokenResult createRefreshToken(User user, UUID familyId, String userAgent, String ip);
    AuthResponse rotateRefreshToken(String rawRefreshToken, String userAgent, String ip);
    void revokeToken(String rawRefreshToken);
}
