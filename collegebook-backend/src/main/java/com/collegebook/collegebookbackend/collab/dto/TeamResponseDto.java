package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class TeamResponseDto {

    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String ownerHandle;
    private String title;
    private TeamType type;
    private String description;
    private String githubLink;
    private List<String> skills;
    private List<String> requiredRoles;
    private List<String> requiredExpertise;
    private int maxMembers;
    private int currentMembersCount;
    private boolean isCompleted;
    private int starsCount;
    private boolean starred;
    private String ownerCollegeName;
    private Instant createdAt;
    private List<TeamMemberDto> members;

    public static class TeamMemberDto {
        private UUID userId;
        private String name;
        private String handle;
        private String role;
        private Instant joinedAt;

        public TeamMemberDto() {
        }

        public TeamMemberDto(UUID userId, String name, String handle, String role, Instant joinedAt) {
            this.userId = userId;
            this.name = name;
            this.handle = handle;
            this.role = role;
            this.joinedAt = joinedAt;
        }

        public TeamMemberDto(UUID userId, String name, String role, Instant joinedAt) {
            this(userId, name, null, role, joinedAt);
        }

        public UUID getUserId() {
            return userId;
        }

        public void setUserId(UUID userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getHandle() {
            return handle;
        }

        public void setHandle(String handle) {
            this.handle = handle;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Instant getJoinedAt() {
            return joinedAt;
        }

        public void setJoinedAt(Instant joinedAt) {
            this.joinedAt = joinedAt;
        }
    }

    public TeamResponseDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerHandle() {
        return ownerHandle;
    }

    public void setOwnerHandle(String ownerHandle) {
        this.ownerHandle = ownerHandle;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public TeamType getType() {
        return type;
    }

    public void setType(TeamType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGithubLink() {
        return githubLink;
    }

    public void setGithubLink(String githubLink) {
        this.githubLink = githubLink;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getRequiredRoles() {
        return requiredRoles;
    }

    public void setRequiredRoles(List<String> requiredRoles) {
        this.requiredRoles = requiredRoles;
    }

    public List<String> getRequiredExpertise() {
        return requiredExpertise;
    }

    public void setRequiredExpertise(List<String> requiredExpertise) {
        this.requiredExpertise = requiredExpertise;
    }

    public int getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }

    public int getCurrentMembersCount() {
        return currentMembersCount;
    }

    public void setCurrentMembersCount(int currentMembersCount) {
        this.currentMembersCount = currentMembersCount;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public int getStarsCount() {
        return starsCount;
    }

    public void setStarsCount(int starsCount) {
        this.starsCount = starsCount;
    }

    public boolean isStarred() {
        return starred;
    }

    public void setStarred(boolean starred) {
        this.starred = starred;
    }

    public String getOwnerCollegeName() {
        return ownerCollegeName;
    }

    public void setOwnerCollegeName(String ownerCollegeName) {
        this.ownerCollegeName = ownerCollegeName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<TeamMemberDto> getMembers() {
        return members;
    }

    public void setMembers(List<TeamMemberDto> members) {
        this.members = members;
    }
}
