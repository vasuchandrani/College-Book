package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CreateTeamRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 120, message = "Title cannot exceed 120 characters")
    private String title;

    @NotNull(message = "Team type is required")
    private TeamType type;

    private String description;
    private String githubLink;
    private List<String> skills;
    private List<String> requiredExpertise;
    private List<String> memberHandles;

    @Min(value = 0, message = "Max members must be at least 0 (0 = unlimited for open source)")
    private int maxMembers = 4;

    public CreateTeamRequest() {
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

    public List<String> getRequiredExpertise() {
        return requiredExpertise;
    }

    public void setRequiredExpertise(List<String> requiredExpertise) {
        this.requiredExpertise = requiredExpertise;
    }

    public List<String> getMemberHandles() {
        return memberHandles;
    }

    public void setMemberHandles(List<String> memberHandles) {
        this.memberHandles = memberHandles;
    }

    public int getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }
}
