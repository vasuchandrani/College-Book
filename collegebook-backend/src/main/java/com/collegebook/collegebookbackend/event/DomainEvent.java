package com.collegebook.collegebookbackend.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public abstract class DomainEvent {
    private String eventId;
    private Instant timestamp;
    private UUID actorId;
    private String actorName;
    private String actorHandle;
    private String actorAvatarUrl;

    public abstract String getEventType();
}
