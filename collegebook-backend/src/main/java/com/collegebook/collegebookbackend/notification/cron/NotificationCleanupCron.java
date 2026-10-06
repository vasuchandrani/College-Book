package com.collegebook.collegebookbackend.notification.cron;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationCleanupCron {

    private final JdbcTemplate jdbcTemplate;

    // Runs every day at 3:00 AM server time
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldNotifications() {
        log.info("Starting scheduled cleanup of old notifications...");
        
        try {
            // Delete notifications older than 2 days
            Timestamp cutoff = Timestamp.from(Instant.now().minus(2, ChronoUnit.DAYS));
            
            String sql = "DELETE FROM notifications WHERE created_at < ?";
            int deletedCount = jdbcTemplate.update(sql, cutoff);
            
            log.info("Successfully deleted {} old notifications.", deletedCount);
        } catch (Exception e) {
            log.error("Failed to cleanup old notifications", e);
        }
    }
}
