package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.event.CollegePostCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CollegePostCreatedHandler implements NotificationHandler<CollegePostCreatedEvent> {

    private final UserRepository userRepository;

    @Override
    public String getEventType() {
        return CollegePostCreatedEvent.TYPE;
    }

    @Override
    public Class<CollegePostCreatedEvent> getEventClass() {
        return CollegePostCreatedEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(CollegePostCreatedEvent event) {
        return userRepository.findByCollegeId(event.getCollegeId())
                .stream()
                .map(User::getId)
                .filter(id -> !id.equals(event.getActorId())) // Don't notify the author
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPayload format(CollegePostCreatedEvent event) {
        return NotificationPayload.builder()
                .title("New Campus Post")
                .message(event.getActorName() + " posted something new on your campus feed.")
                .actionUrl("/post/" + event.getPostId())
                .build();
    }
}
