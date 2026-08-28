package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponseDto {

    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String ownerHandle;
    private String ownerAvatarUrl;
    private String title;
    private TeamType type;
    private String description;
    private String githubLink;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    private List<String> requiredRoles = new ArrayList<>();

    @Builder.Default
    private List<String> requiredExpertise = new ArrayList<>();

    private int maxMembers;
    private int currentMembersCount;
    private boolean isCompleted;
    private int starsCount;
    private boolean starred;
    private boolean hasUnreadMessages;
    private int pendingJoinRequestsCount;
    private String ownerCollegeName;
    private Instant createdAt;

    @Builder.Default
    private List<TeamMemberDto> members = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberDto {
        private UUID userId;
        private String name;
        private String handle;
        private String role;
        private Instant joinedAt;
        private String avatarUrl;
        private String initials;

        public TeamMemberDto(UUID userId, String name, String role, Instant joinedAt) {
            this(userId, name, null, role, joinedAt, null, null);
        }

        public TeamMemberDto(UUID userId, String name, String handle, String role, Instant joinedAt) {
            this(userId, name, handle, role, joinedAt, null, null);
        }
    }
}
