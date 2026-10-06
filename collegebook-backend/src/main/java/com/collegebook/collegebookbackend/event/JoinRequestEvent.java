package com.collegebook.collegebookbackend.event;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class JoinRequestEvent extends DomainEvent {
    public static final String TYPE = "JOIN_REQUEST";
    
    private UUID collabId;
    private String collabTitle;
    private UUID ownerId;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
