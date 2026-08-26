package com.collegebook.collegebookbackend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceEventDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID teamId;
    private String eventType; // "JOIN", "LEAVE", "SYNC"
    private UUID userId;
    private String userName;
    private List<ChatUserDto> activeMembers;
}
