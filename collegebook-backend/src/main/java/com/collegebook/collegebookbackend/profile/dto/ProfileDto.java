package com.collegebook.collegebookbackend.profile.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    private UUID userId;
    private String handle;
    private String fullName;
    private String initials;
    private String gender;
    private UUID collegeId;
    private String collegeName;
    private String collegeShortName;
    private String collegeSlug;
    private UUID courseId;
    private String courseName;
    private Integer currentYear;
    private String defaultBio;
    private String bioExtra;
    private String avatarUrl;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private String memoryBookEmail;
    private String customLinks;
    private String contactDetails;
    private boolean isPublic;
}
