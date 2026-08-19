package com.collegebook.collegebookbackend.config.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RedisRateLimitServiceImpl implements RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RedisRateLimitServiceImpl.class);

    private final StringRedisTemplate redisTemplate;

    // In-memory fallback if Redis is unreachable / during offline testing
    private final Map<String, InMemoryCounter> inMemoryStore = new ConcurrentHashMap<>();

    @Autowired
    public RedisRateLimitServiceImpl(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public RateLimitResult tryAcquire(String key, int maxRequests, Duration window) {
        if (redisTemplate != null) {
            try {
                return tryAcquireRedis(key, maxRequests, window);
            } catch (Exception e) {
                log.warn("Redis rate limit failed for key {}, falling back to in-memory: {}", key, e.getMessage());
            }
        }
        return tryAcquireInMemory(key, maxRequests, window);
    }

    private RateLimitResult tryAcquireRedis(String key, int maxRequests, Duration window) {
        String redisKey = "cb:ratelimit:" + key;
        Long currentCount = redisTemplate.opsForValue().increment(redisKey);

        if (currentCount == null) {
            return tryAcquireInMemory(key, maxRequests, window);
        }

        if (currentCount == 1) {
            redisTemplate.expire(redisKey, window);
        }

        Long expireSeconds = redisTemplate.getExpire(redisKey);
        long resetSeconds = (expireSeconds != null && expireSeconds > 0) ? expireSeconds : window.toSeconds();

        if (currentCount <= maxRequests) {
            long remaining = Math.max(0, maxRequests - currentCount);
            return RateLimitResult.allow(maxRequests, remaining, resetSeconds);
        } else {
            return RateLimitResult.reject(maxRequests, resetSeconds);
        }
    }

    private RateLimitResult tryAcquireInMemory(String key, int maxRequests, Duration window) {
        long now = Instant.now().toEpochMilli();
        long windowMillis = window.toMillis();

        InMemoryCounter counter = inMemoryStore.compute(key, (k, existing) -> {
            if (existing == null || now > existing.expiresAtMillis) {
                return new InMemoryCounter(new AtomicInteger(1), now + windowMillis);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        long resetSeconds = Math.max(1, (counter.expiresAtMillis - now) / 1000);
        int current = counter.count.get();

        if (current <= maxRequests) {
            return RateLimitResult.allow(maxRequests, maxRequests - current, resetSeconds);
        } else {
            return RateLimitResult.reject(maxRequests, resetSeconds);
        }
    }

    private static class InMemoryCounter {
        final AtomicInteger count;
        final long expiresAtMillis;

        InMemoryCounter(AtomicInteger count, long expiresAtMillis) {
            this.count = count;
            this.expiresAtMillis = expiresAtMillis;
        }
    }
}
