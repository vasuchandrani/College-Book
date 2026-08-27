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
public class PublicProfileHeaderDto {

    private UUID userId;
    private String handle;
    private String slug;
    private String fullName;
    private String initials;
    private String courseName;
    private String courseShortName;
    private String departmentName;
    private String departmentShortName;
    private String collegeName;
    private String collegeShortName;
    private String collegeSlug;
    private Short currentYear;
    private String defaultBio;
    private String avatarUrl;
}
