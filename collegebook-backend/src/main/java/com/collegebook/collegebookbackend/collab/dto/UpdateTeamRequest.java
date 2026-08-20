package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class UpdateTeamRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 120, message = "Title cannot exceed 120 characters")
    private String title;

    private TeamType type;
    private String description;
    private String githubLink;
    private List<String> skills;
    private List<String> requiredRoles;
    private List<String> requiredExpertise;

    @Min(value = 0, message = "Max members must be at least 0 (0 = unlimited for open source)")
    private Integer maxMembers;

    public UpdateTeamRequest() {
    }

    public UpdateTeamRequest(String title, TeamType type, String description, String githubLink, List<String> skills, List<String> requiredRoles, List<String> requiredExpertise, Integer maxMembers) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.githubLink = githubLink;
        this.skills = skills;
        this.requiredRoles = requiredRoles;
        this.requiredExpertise = requiredExpertise;
        this.maxMembers = maxMembers;
    }

    public UpdateTeamRequest(String title, TeamType type, String description, String githubLink, List<String> skills, List<String> requiredExpertise, Integer maxMembers) {
        this(title, type, description, githubLink, skills, requiredExpertise, requiredExpertise, maxMembers);
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

    public Integer getMaxMembers() {
        return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
        this.maxMembers = maxMembers;
    }
}
