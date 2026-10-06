package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.auth.repository.UserRepository;
import com.collegebook.collegebookbackend.event.CollegeCollabCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CollegeCollabCreatedHandler implements NotificationHandler<CollegeCollabCreatedEvent> {

    private final UserRepository userRepository;

    @Override
    public String getEventType() {
        return CollegeCollabCreatedEvent.TYPE;
    }

    @Override
    public Class<CollegeCollabCreatedEvent> getEventClass() {
        return CollegeCollabCreatedEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(CollegeCollabCreatedEvent event) {
        return userRepository.findByCollegeId(event.getCollegeId())
                .stream()
                .map(User::getId)
                .filter(id -> !id.equals(event.getActorId()))
                .collect(Collectors.toList());
    }

    @Override
    public NotificationPayload format(CollegeCollabCreatedEvent event) {
        return NotificationPayload.builder()
                .title("New Collab Request")
                .message(event.getActorName() + " posted a team project on the campus collab hub.")
                .actionUrl("/collab/" + event.getCollabId())
                .build();
    }
}
