package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.TeamType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(max = 120, message = "Title cannot exceed 120 characters")
    private String title;

    @NotNull(message = "Team type is required")
    private TeamType type;

    private String description;
    private String githubLink;

    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Builder.Default
    private List<String> requiredRoles = new ArrayList<>();

    @Builder.Default
    private List<String> requiredExpertise = new ArrayList<>();

    @Builder.Default
    private List<String> memberHandles = new ArrayList<>();

    @Min(value = 0, message = "Max members must be at least 0 (0 = unlimited for open source)")
    @Builder.Default
    private int maxMembers = 4;
}
