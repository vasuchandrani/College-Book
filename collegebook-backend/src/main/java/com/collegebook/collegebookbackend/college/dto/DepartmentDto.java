package com.collegebook.collegebookbackend.college.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {

    private UUID id;
    private UUID courseId;
    private String name;
    private String shortName;
}
