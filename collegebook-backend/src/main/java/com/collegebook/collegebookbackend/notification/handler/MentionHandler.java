package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.MentionEvent;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class MentionHandler implements NotificationHandler<MentionEvent> {

    @Override
    public String getEventType() {
        return "MENTION";
    }

    @Override
    public Class<MentionEvent> getEventClass() {
        return MentionEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(MentionEvent event) {
        return Collections.singletonList(event.getMentionedUserId());
    }

    @Override
    public NotificationPayload format(MentionEvent event) {
        return NotificationPayload.builder()
                .title("New Mention")
                .message("Someone mentioned you in a " + 
                         (event.getContext() != null ? event.getContext().toLowerCase().replace("_", " ") : "post") + ".")
                .actionUrl("/" + (event.getContext() != null && event.getContext().startsWith("ROOM") ? "collab" : "post") + "/" + event.getTargetId())
                .build();
    }
}
