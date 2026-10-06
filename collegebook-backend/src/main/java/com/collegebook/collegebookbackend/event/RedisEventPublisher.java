package com.collegebook.collegebookbackend.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisEventPublisher implements EventPublisher {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    // We cap the stream to ~10,000 items to keep EC2 Redis RAM strictly < 5MB
    private static final long MAX_STREAM_LENGTH = 10000L;

    @Override
    public void publish(DomainEvent event) {
        if (event.getEventId() == null) {
            event.setEventId(UUID.randomUUID().toString());
        }
        if (event.getTimestamp() == null) {
            event.setTimestamp(Instant.now());
        }

        try {
            String payload = objectMapper.writeValueAsString(event);
            String streamKey = "cb:events:notifications";

            Map<String, String> fields = new HashMap<>();
            fields.put("eventType", event.getEventType());
            fields.put("payload", payload);

            MapRecord<String, String, String> record = StreamRecords.newRecord()
                    .ofMap(fields)
                    .withStreamKey(streamKey);

            // Add to stream with approximate max length (the ~ means it doesn't have to be exact, which is faster)
            RecordId recordId = redisTemplate.opsForStream().add(record);
            
            // Trim to max length (using manual trim since add() with maxlen is sometimes tricky in Spring Data Redis depending on version)
            redisTemplate.opsForStream().trim(streamKey, MAX_STREAM_LENGTH);

            log.debug("Published event {} to stream {}", event.getEventType(), streamKey);

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize DomainEvent: {}", event.getEventType(), e);
        }
    }
}
