package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.JoinRequestRespondedEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class JoinRequestRespondedHandler implements NotificationHandler<JoinRequestRespondedEvent> {

    @Override
    public String getEventType() {
        return JoinRequestRespondedEvent.TYPE;
    }

    @Override
    public Class<JoinRequestRespondedEvent> getEventClass() {
        return JoinRequestRespondedEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(JoinRequestRespondedEvent event) {
        return Collections.singletonList(event.getRequesterId());
    }

    @Override
    public NotificationPayload format(JoinRequestRespondedEvent event) {
        boolean accepted = "ACCEPTED".equalsIgnoreCase(event.getStatus());
        String title = accepted ? "Join Request Accepted" : "Join Request Update";
        String message = accepted 
            ? "Your request to join '" + event.getCollabTitle() + "' was accepted! You are now a team member." 
            : "Your request to join '" + event.getCollabTitle() + "' was not accepted.";
            
        return NotificationPayload.builder()
                .title(title)
                .message(message)
                .actionUrl("/collab/" + event.getCollabId())
                .build();
    }
}
