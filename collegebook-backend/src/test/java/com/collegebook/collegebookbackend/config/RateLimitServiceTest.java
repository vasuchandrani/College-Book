package com.collegebook.collegebookbackend.config;

import com.collegebook.collegebookbackend.config.ratelimit.RateLimitResult;
import com.collegebook.collegebookbackend.config.ratelimit.RateLimitService;
import com.collegebook.collegebookbackend.config.ratelimit.RedisRateLimitServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RateLimitServiceTest {

    private RateLimitService rateLimitService;

    @BeforeEach
    void setUp() {
        // Test in-memory fallback mode (null RedisTemplate)
        rateLimitService = new RedisRateLimitServiceImpl(null);
    }

    @Test
    void testRateLimitAllowsWithinQuota() {
        String key = "test_ip_1";
        Duration window = Duration.ofMinutes(1);

        for (int i = 1; i <= 5; i++) {
            RateLimitResult result = rateLimitService.tryAcquire(key, 5, window);
            assertTrue(result.allowed(), "Request " + i + " should be allowed");
            assertEquals(5 - i, result.remaining(), "Remaining quota should decrease");
        }
    }

    @Test
    void testRateLimitBlocksWhenQuotaExceeded() {
        String key = "test_ip_2";
        Duration window = Duration.ofMinutes(1);

        for (int i = 0; i < 3; i++) {
            rateLimitService.tryAcquire(key, 3, window);
        }

        RateLimitResult fourth = rateLimitService.tryAcquire(key, 3, window);
        assertFalse(fourth.allowed(), "4th request should be rejected");
        assertEquals(0, fourth.remaining());
        assertTrue(fourth.resetSeconds() > 0);
    }
}
