package com.collegebook.collegebookbackend.event;

public interface EventPublisher {
    void publish(DomainEvent event);
}
