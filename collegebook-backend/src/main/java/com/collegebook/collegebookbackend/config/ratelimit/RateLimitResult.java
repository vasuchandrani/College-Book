package com.collegebook.collegebookbackend.config.ratelimit;

public record RateLimitResult(
        boolean allowed,
        long limit,
        long remaining,
        long resetSeconds
) {
    public static RateLimitResult allow(long limit, long remaining, long resetSeconds) {
        return new RateLimitResult(true, limit, remaining, resetSeconds);
    }

    public static RateLimitResult reject(long limit, long resetSeconds) {
        return new RateLimitResult(false, limit, 0, resetSeconds);
    }
}
