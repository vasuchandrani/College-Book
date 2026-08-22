package com.collegebook.collegebookbackend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateDto {

    private String fullName;
    private String defaultBio;
    private UUID courseId;
    private UUID departmentId;
    private Short currentYear;
    private String bioExtra;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private String customLinks;
    private String contactDetails;
    private Boolean isPublic;
}
