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
public class JoinRequestRespondedEvent extends DomainEvent {
    public static final String TYPE = "JOIN_REQUEST_RESPONDED";
    
    private UUID collabId;
    private String collabTitle;
    private UUID requesterId;
    private String status; // ACCEPTED or REJECTED
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
