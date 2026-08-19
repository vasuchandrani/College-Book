package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.entity.AppRole;
import com.collegebook.collegebookbackend.auth.entity.RefreshToken;
import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.entity.UserRole;
import com.collegebook.collegebookbackend.auth.repository.RefreshTokenRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.auth.repository.UserRoleRepository;
import com.collegebook.collegebookbackend.auth.service.TokenService;
import com.collegebook.collegebookbackend.auth.service.impl.TokenServiceImpl;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRoleRepository userRoleRepository;

    @Mock
    private JwtService jwtService;

    private TokenServiceImpl tokenService;

    @BeforeEach
    void setUp() {
        tokenService = new TokenServiceImpl(refreshTokenRepository, userRepository, userRoleRepository, jwtService);
        ReflectionTestUtils.setField(tokenService, "refreshTokenExpirationDays", 30L);
    }

    @Test
    void testCreateRefreshTokenSuccess() {
        User user = new User();
        user.setId(UUID.randomUUID());

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> {
            RefreshToken r = i.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        TokenService.RefreshTokenResult res = tokenService.createRefreshToken(user, null, "Agent", "127.0.0.1");

        assertNotNull(res);
        assertNotNull(res.rawToken());
        assertNotNull(res.tokenId());
    }

    @Test
    void testRotateRefreshTokenSuccess() {
        User user = new User();
        user.setId(UUID.randomUUID());
        College c = new College();
        c.setId(UUID.randomUUID());
        user.setCollege(c);

        UUID familyId = UUID.randomUUID();

        RefreshToken stored = new RefreshToken();
        stored.setId(UUID.randomUUID());
        stored.setUser(user);
        stored.setFamilyId(familyId);
        stored.setExpiresAt(Instant.now().plus(10, ChronoUnit.DAYS));
        stored.setRevokedAt(null);

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> {
            RefreshToken r = i.getArgument(0);
            if (r.getId() == null) r.setId(UUID.randomUUID());
            return r;
        });

        UserRole role = new UserRole();
        role.setRole(AppRole.STUDENT);
        when(userRoleRepository.findByUserId(user.getId())).thenReturn(List.of(role));
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("newJwtToken");

        TokenService.AuthResponse resp = tokenService.rotateRefreshToken("raw-token-123", "Agent", "127.0.0.1");

        assertNotNull(resp);
        assertEquals("newJwtToken", resp.accessToken());
        assertNotNull(resp.refreshToken());
    }

    @Test
    void testRotateRefreshTokenReusedThrowsException() {
        RefreshToken stored = new RefreshToken();
        stored.setId(UUID.randomUUID());
        stored.setFamilyId(UUID.randomUUID());
        stored.setRevokedAt(Instant.now().minus(1, ChronoUnit.DAYS));

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));

        AppException ex = assertThrows(AppException.class,
                () -> tokenService.rotateRefreshToken("reused-token", "Agent", "127.0.0.1"));

        assertEquals(ErrorCode.TOKEN_REVOKED, ex.getErrorCode());
        verify(refreshTokenRepository).revokeFamily(stored.getFamilyId());
    }

    @Test
    void testRotateRefreshTokenExpiredThrowsException() {
        RefreshToken stored = new RefreshToken();
        stored.setId(UUID.randomUUID());
        stored.setFamilyId(UUID.randomUUID());
        stored.setRevokedAt(null);
        stored.setExpiresAt(Instant.now().minus(1, ChronoUnit.DAYS));

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));

        AppException ex = assertThrows(AppException.class,
                () -> tokenService.rotateRefreshToken("expired-token", "Agent", "127.0.0.1"));

        assertEquals(ErrorCode.TOKEN_EXPIRED, ex.getErrorCode());
    }

    @Test
    void testRevokeTokenSuccess() {
        RefreshToken stored = new RefreshToken();
        stored.setId(UUID.randomUUID());

        when(refreshTokenRepository.findByTokenHash(any())).thenReturn(Optional.of(stored));

        tokenService.revokeToken("some-raw-token");

        assertNotNull(stored.getRevokedAt());
        verify(refreshTokenRepository).save(stored);
    }
}
