package com.collegebook.collegebookbackend.college.dto;

import java.util.UUID;

public class DepartmentDto {

    private UUID id;
    private UUID courseId;
    private String name;
    private String shortName;

    public DepartmentDto() {
    }

    public DepartmentDto(UUID id, UUID courseId, String name, String shortName) {
        this.id = id;
        this.courseId = courseId;
        this.name = name;
        this.shortName = shortName;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCourseId() {
        return courseId;
    }

    public void setCourseId(UUID courseId) {
        this.courseId = courseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }
}
