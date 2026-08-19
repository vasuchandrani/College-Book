package com.collegebook.collegebookbackend.auth.service.impl;

import com.collegebook.collegebookbackend.auth.entity.RefreshToken;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.RefreshTokenRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRoleRepository;
import com.collegebook.collegebookbackend.auth.service.TokenService;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class TokenServiceImpl implements TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final JwtService jwtService;

    @Value("${jwt.refresh-expiration-days:30}")
    private long refreshTokenExpirationDays;

    public TokenServiceImpl(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            JwtService jwtService
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public RefreshTokenResult createRefreshToken(User user, UUID familyId, String userAgent, String ip) {
        String rawToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        UUID effectiveFamilyId = (familyId != null) ? familyId : UUID.randomUUID();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setFamilyId(effectiveFamilyId);
        refreshToken.setExpiresAt(Instant.now().plus(Duration.ofDays(refreshTokenExpirationDays)));
        refreshToken.setUserAgent(userAgent);
        refreshToken.setIpAddress(ip);

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        return new RefreshTokenResult(rawToken, saved.getId());
    }

    @Override
    @Transactional
    public AuthResponse rotateRefreshToken(String rawRefreshToken, String userAgent, String ip) {
        String hash = hashToken(rawRefreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN, "Refresh token not found"));

        if (storedToken.getRevokedAt() != null) {
            refreshTokenRepository.revokeFamily(storedToken.getFamilyId());
            throw new AppException(ErrorCode.TOKEN_REVOKED, "Refresh token reused! Entire token family has been revoked.");
        }

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED, "Refresh token has expired");
        }

        User user = storedToken.getUser();

        RefreshTokenResult newRefreshTokenResult = createRefreshToken(user, storedToken.getFamilyId(), userAgent, ip);

        storedToken.setRevokedAt(Instant.now());
        refreshTokenRepository.save(storedToken);

        List<String> roles = userRoleRepository.findByUserId(user.getId())
                .stream()
                .map(r -> r.getRole().name())
                .toList();

        String newAccessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getCollege() != null ? user.getCollege().getId() : null,
                roles
        );

        return new AuthResponse(newAccessToken, newRefreshTokenResult.rawToken());
    }

    @Override
    @Transactional
    public void revokeToken(String rawRefreshToken) {
        String hash = hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
            token.setRevokedAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
