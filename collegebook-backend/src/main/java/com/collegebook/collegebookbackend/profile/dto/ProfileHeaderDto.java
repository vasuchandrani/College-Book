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
public class ProfileHeaderDto {

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
    private String courseShortName;
    private UUID departmentId;
    private String departmentName;
    private String departmentShortName;
    private Integer currentYear;
    private String defaultBio;
    private String avatarUrl;
    private boolean isPublic;
}
