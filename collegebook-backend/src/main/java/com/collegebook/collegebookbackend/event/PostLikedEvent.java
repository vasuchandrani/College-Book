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
public class PostLikedEvent extends DomainEvent {
    public static final String TYPE = "POST_LIKED";
    
    private UUID postId;
    private UUID postAuthorId;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
