package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.event.DomainEvent;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class NotificationHandlerRegistry {

    private final Map<String, NotificationHandler<? extends DomainEvent>> handlers = new HashMap<>();

    public NotificationHandlerRegistry(List<NotificationHandler<? extends DomainEvent>> handlerList) {
        for (NotificationHandler<? extends DomainEvent> handler : handlerList) {
            handlers.put(handler.getEventType(), handler);
        }
    }

    @SuppressWarnings("unchecked")
    public <E extends DomainEvent> NotificationHandler<E> getHandler(String eventType) {
        return (NotificationHandler<E>) handlers.get(eventType);
    }
}
