package com.collegebook.collegebookbackend.config.ratelimit;

import com.collegebook.collegebookbackend.common.ApiError;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitFilter(
            @org.springframework.beans.factory.annotation.Autowired(required = false) RateLimitService rateLimitService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) ObjectMapper objectMapper
    ) {
        this.rateLimitService = rateLimitService != null ? rateLimitService : new RedisRateLimitServiceImpl(null);
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper().findAndRegisterModules();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip health checks, docs, preflight OPTIONS, and WebSocket handshakes
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.startsWith("/actuator/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/ws")
                || path.equals("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String clientIp = extractClientIp(request);
        String path = request.getRequestURI();
        String method = request.getMethod();

        LimitRule rule = resolveRule(path, method, clientIp);
        String rateLimitKey = rule.category + ":" + clientIp;

        RateLimitResult result = rateLimitService.tryAcquire(rateLimitKey, rule.maxRequests, rule.window);

        // Standard rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));
        response.setHeader("X-RateLimit-Reset", String.valueOf(result.resetSeconds()));

        if (!result.allowed()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(result.resetSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            ApiError error = ApiError.builder()
                    .code(ErrorCode.RATE_LIMIT_EXCEEDED.name())
                    .message("Too many requests. Please slow down and try again in " + result.resetSeconds() + " seconds.")
                    .timestamp(Instant.now())
                    .path(path)
                    .build();

            objectMapper.writeValue(response.getOutputStream(), error);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private LimitRule resolveRule(String path, String method, String clientIp) {
        boolean isLocal = clientIp == null || "127.0.0.1".equals(clientIp) || "::1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp) || "localhost".equalsIgnoreCase(clientIp);

        // 1. OTP sending endpoints (strict IP limit to prevent bot flooding)
        if (path.contains("/otp/send") || path.equals("/api/v1/auth/forgot-password")) {
            return new LimitRule("otp_ip", isLocal ? 120 : 15, Duration.ofMinutes(15));
        }

        // 2. Sensitive auth endpoints (login, signup, reset)
        if (path.startsWith("/api/v1/auth/login") || path.startsWith("/api/v1/auth/signup") || path.startsWith("/api/v1/auth/reset-password")) {
            return new LimitRule("auth", isLocal ? 1000 : 30, Duration.ofMinutes(1));
        }

        // 3. Media storage upload & presign
        if (path.startsWith("/api/v1/storage")) {
            return new LimitRule("storage", isLocal ? 1000 : 60, Duration.ofMinutes(1));
        }

        // 4. Mutating write operations (includes chat messages HTTP fallback)
        if ("POST".equalsIgnoreCase(method) || "PUT".equalsIgnoreCase(method) || "PATCH".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
            return new LimitRule("write", isLocal ? 5000 : 200, Duration.ofMinutes(1));
        }

        // 5. Global read / browsing (high throughput for SPA data loading & campus Wi-Fi)
        return new LimitRule("global", isLocal ? 10000 : 1200, Duration.ofMinutes(1));
    }

    private String extractClientIp(HttpServletRequest request) {
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (cfConnectingIp != null && !cfConnectingIp.isBlank()) {
            return cfConnectingIp.trim();
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private record LimitRule(String category, int maxRequests, Duration window) {
    }
}
