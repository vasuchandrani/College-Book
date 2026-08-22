package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    public UpdateTeamRequest(String title, TeamType type, String description, String githubLink, List<String> skills, List<String> requiredExpertise, Integer maxMembers) {
        this(title, type, description, githubLink, skills, requiredExpertise, requiredExpertise, maxMembers);
    }
}
