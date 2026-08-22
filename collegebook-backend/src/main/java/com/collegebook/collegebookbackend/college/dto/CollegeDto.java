package com.collegebook.collegebookbackend.college.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollegeDto {

    private UUID id;
    private String name;
    private String shortName;
    private String slug;
    private String city;
    private String state;
    private String logoUrl;
    private List<String> emailDomains;
}
