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
public class PublicProfileAboutDto {

    private UUID userId;
    private String handle;
    private String bioExtra;
    private String githubUrl;
    private String linkedinUrl;
    private String websiteUrl;
    private String customLinks;
    private String contactDetails;
}
