package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.PostLikedEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class PostLikedHandler implements NotificationHandler<PostLikedEvent> {

    @Override
    public String getEventType() {
        return PostLikedEvent.TYPE;
    }

    @Override
    public Class<PostLikedEvent> getEventClass() {
        return PostLikedEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(PostLikedEvent event) {
        return Collections.singletonList(event.getPostAuthorId());
    }

    @Override
    public NotificationPayload format(PostLikedEvent event) {
        return NotificationPayload.builder()
                .title("New Like")
                .message(event.getActorName() + " liked your post.")
                .actionUrl("/post/" + event.getPostId())
                .build();
    }
}
