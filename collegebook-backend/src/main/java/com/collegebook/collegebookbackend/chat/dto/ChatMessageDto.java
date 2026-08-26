package com.collegebook.collegebookbackend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private UUID id;
    private UUID teamId;
    private UUID senderId;
    private String senderName;
    private String senderHandle;
    private String avatarUrl;
    private String initials;
    private String collegeName;
    private String collegeShortName;
    private String role; // "LEAD" or "MEMBER"
    private String content;
    private String messageType; // "TEXT", "CODE", "SYSTEM", "IMAGE"
    private String mediaUrl;
    private Instant createdAt;
    private String time;
}
