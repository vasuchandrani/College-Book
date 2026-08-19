package com.collegebook.collegebookbackend.config.ratelimit;

import java.time.Duration;

public interface RateLimitService {

    /**
     * Attempts to acquire a rate limit token for the given key within the time window.
     *
     * @param key         Unique identifier (e.g. IP, userId, or email)
     * @param maxRequests Maximum allowed requests in the time window
     * @param window      Duration window (e.g. 1 minute, 1 hour)
     * @return RateLimitResult indicating if allowed, remaining tokens, and reset time
     */
    RateLimitResult tryAcquire(String key, int maxRequests, Duration window);
}
