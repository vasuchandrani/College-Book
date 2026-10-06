package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.JoinRequestEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class JoinRequestHandler implements NotificationHandler<JoinRequestEvent> {

    @Override
    public String getEventType() {
        return JoinRequestEvent.TYPE;
    }

    @Override
    public Class<JoinRequestEvent> getEventClass() {
        return JoinRequestEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(JoinRequestEvent event) {
        return Collections.singletonList(event.getOwnerId());
    }

    @Override
    public NotificationPayload format(JoinRequestEvent event) {
        return NotificationPayload.builder()
                .title("New Join Request")
                .message(event.getActorName() + " requested to join your project: " + event.getCollabTitle())
                .actionUrl("/collab/" + event.getCollabId())
                .build();
    }
}
