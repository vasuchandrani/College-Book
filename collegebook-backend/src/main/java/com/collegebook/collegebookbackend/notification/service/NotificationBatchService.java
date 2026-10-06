package com.collegebook.collegebookbackend.notification.service;

import com.collegebook.collegebookbackend.notification.handler.NotificationPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationBatchService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void batchInsertNotifications(List<UUID> recipientIds, String eventType, NotificationPayload payload) {
        if (recipientIds == null || recipientIds.isEmpty()) return;

        String sql = "INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, false, ?)";

        Timestamp now = Timestamp.from(Instant.now());

        jdbcTemplate.batchUpdate(sql, recipientIds, 500,
                (ps, userId) -> {
                    ps.setObject(1, UUID.randomUUID());
                    ps.setObject(2, userId);
                    ps.setString(3, eventType);
                    ps.setString(4, payload.getTitle());
                    ps.setString(5, payload.getMessage());
                    ps.setTimestamp(6, now);
                });

        log.debug("Batch inserted {} notifications for event type {}", recipientIds.size(), eventType);
    }
}
