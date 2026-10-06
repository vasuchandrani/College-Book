package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.DomainEvent;

import java.util.List;
import java.util.UUID;

public interface NotificationHandler<E extends DomainEvent> {
    String getEventType();
    Class<E> getEventClass();
    List<UUID> resolveRecipients(E event);
    NotificationPayload format(E event);
}
