package com.collegebook.collegebookbackend.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDiscussionResponseDto {

    private UUID id;
    private UUID teamId;
    private UUID authorId;
    private String authorName;
    private String authorHandle;
    private String avatarUrl;
    private String initials;
    private String collegeName;
    private String collegeShortName;
    private String body;
    private String time;
    private Instant createdAt;
}
