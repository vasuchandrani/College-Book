package com.collegebook.collegebookbackend.notification.handler;

import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamMember;
import com.collegebook.collegebookbackend.collab.repository.TeamMemberRepository;
import com.collegebook.collegebookbackend.collab.repository.TeamRepository;
import com.collegebook.collegebookbackend.event.RoomChatMessageEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RoomChatMessageHandler implements NotificationHandler<RoomChatMessageEvent> {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Override
    public String getEventType() {
        return "ROOM_CHAT_MESSAGE";
    }

    @Override
    public Class<RoomChatMessageEvent> getEventClass() {
        return RoomChatMessageEvent.class;
    }

    @Override
    public List<UUID> resolveRecipients(RoomChatMessageEvent event) {
        List<UUID> recipients = new ArrayList<>();
        
        Team team = teamRepository.findById(event.getRoomId()).orElse(null);
        if (team == null) {
            return recipients;
        }

        // Add owner
        if (team.getOwner() != null && !team.getOwner().getId().equals(event.getActorId())) {
            recipients.add(team.getOwner().getId());
        }

        // Add members
        List<TeamMember> members = teamMemberRepository.findByIdTeamId(event.getRoomId());
        for (TeamMember member : members) {
            if (!member.getId().getUserId().equals(event.getActorId())) {
                recipients.add(member.getId().getUserId());
            }
        }

        return recipients;
    }

    @Override
    public NotificationPayload format(RoomChatMessageEvent event) {
        return NotificationPayload.builder()
                .title("New Message in " + event.getRoomName())
                .message("New message: " + event.getMessagePreview())
                .actionUrl("/collab/" + event.getRoomId())
                .build();
    }
}
