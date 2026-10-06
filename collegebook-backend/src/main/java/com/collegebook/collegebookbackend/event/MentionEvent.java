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
public class MentionEvent extends DomainEvent {
    public static final String TYPE = "MENTION";
    
    private UUID mentionedUserId;
    private String context; // e.g. "COMMENT" or "PROJECT_DISCUSSION"
    private UUID targetId; // ID of the post or project
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
