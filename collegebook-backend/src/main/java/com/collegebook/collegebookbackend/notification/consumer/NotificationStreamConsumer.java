package com.collegebook.collegebookbackend.notification.consumer;

import com.collegebook.collegebookbackend.event.DomainEvent;
import com.collegebook.collegebookbackend.notification.handler.NotificationHandler;
import com.collegebook.collegebookbackend.notification.handler.NotificationHandlerRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.connection.stream.StreamReadOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.collegebook.collegebookbackend.notification.service.NotificationBatchService;
import com.collegebook.collegebookbackend.notification.service.NotificationService;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationStreamConsumer {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final NotificationHandlerRegistry registry;
    private final NotificationBatchService notificationBatchService;
    private final NotificationService notificationService;

    private static final String STREAM_KEY = "cb:events:notifications";
    private static final String GROUP_NAME = "notification-workers";
    private static final String CONSUMER_NAME = "worker-1"; // In multi-instance, this should be unique per EC2

    @PostConstruct
    public void init() {
        try {
            // Create the consumer group if it doesn't exist
            redisTemplate.opsForStream().createGroup(STREAM_KEY, ReadOffset.from("0"), GROUP_NAME);
            log.info("Created Redis Stream Consumer Group: {}", GROUP_NAME);
        } catch (Exception e) {
            // Exception thrown if group already exists, which is fine
            log.debug("Consumer group {} already exists on stream {}", GROUP_NAME, STREAM_KEY);
        }
    }

    @Scheduled(fixedDelayString = "${app.notification.stream.poll.interval:1000}")
    public void pollEvents() {
        try {
            // Read up to 500 events at a time, blocking for max 100ms
            List<MapRecord<String, Object, Object>> records = redisTemplate.opsForStream().read(
                    Consumer.from(GROUP_NAME, CONSUMER_NAME),
                    StreamReadOptions.empty().count(500).block(Duration.ofMillis(100)),
                    StreamOffset.create(STREAM_KEY, ReadOffset.lastConsumed())
            );

            if (records == null || records.isEmpty()) {
                return;
            }

            for (MapRecord<String, Object, Object> record : records) {
                processRecord(record);
                // Acknowledge the message so it's not processed again
                redisTemplate.opsForStream().acknowledge(GROUP_NAME, record);
            }
        } catch (Exception e) {
            log.error("Error polling Redis stream for notifications", e);
        }
    }

    @SuppressWarnings("unchecked")
    private void processRecord(MapRecord<String, Object, Object> record) {
        try {
            Map<Object, Object> value = record.getValue();
            String eventType = (String) value.get("eventType");
            String payload = (String) value.get("payload");

            NotificationHandler handler = registry.getHandler(eventType);
            if (handler == null) {
                log.warn("No handler found for event type: {}", eventType);
                return;
            }

            // Deserialize to specific event class
            DomainEvent event = (DomainEvent) objectMapper.readValue(payload, handler.getEventClass());

            // 1. Resolve recipients
            List<UUID> recipients = handler.resolveRecipients(event);
            if (recipients == null || recipients.isEmpty()) {
                return;
            }

            // 2. Fast Unread Count Increment in Redis
            for (UUID recipientId : recipients) {
                redisTemplate.opsForValue().increment("cb:notif:unread:" + recipientId);
            }

            log.info("Processed event {} and pushed unread counts to {} users", eventType, recipients.size());

            // 3. Trigger Batch Insert to PostgreSQL
            com.collegebook.collegebookbackend.notification.handler.NotificationPayload formattedPayload = handler.format(event);
            notificationBatchService.batchInsertNotifications(recipients, eventType, formattedPayload);

            // 4. Send Web Push Async
            notificationService.sendPushNotificationsAsync(recipients, eventType, formattedPayload.getTitle(), formattedPayload.getMessage());

        } catch (Exception e) {
            log.error("Failed to process event record: {}", record.getId(), e);
        }
    }
}
