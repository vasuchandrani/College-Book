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
public class PostCommentedEvent extends DomainEvent {
    public static final String TYPE = "POST_COMMENTED";
    
    private UUID postId;
    private UUID postAuthorId;
    private String commentPreview;
    
    @Override
    public String getEventType() {
        return TYPE;
    }
}
