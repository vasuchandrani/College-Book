package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.PostCommentedEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class PostCommentedHandler implements NotificationHandler<PostCommentedEvent> {

    @Override
    public String getEventType() {
        return PostCommentedEvent.TYPE;
    }

    @Override
    public Class<PostCommentedEvent> getEventClass() {
        return PostCommentedEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(PostCommentedEvent event) {
        return Collections.singletonList(event.getPostAuthorId());
    }

    @Override
    public NotificationPayload format(PostCommentedEvent event) {
        return NotificationPayload.builder()
                .title("New Comment")
                .message(event.getActorName() + " commented on your post: " + event.getCommentPreview())
                .actionUrl("/post/" + event.getPostId())
                .build();
    }
}
