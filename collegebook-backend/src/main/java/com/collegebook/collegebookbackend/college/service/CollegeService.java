package com.collegebook.collegebookbackend.college.service;

import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;

import java.util.List;
import java.util.UUID;

public interface CollegeService {
    List<CollegeDto> getAllColleges();
    CollegeDto getCollegeBySlug(String slug);
    List<CourseDto> getCoursesByCollegeId(UUID collegeId);
    com.collegebook.collegebookbackend.college.dto.CollegeRequestDto requestCollege(com.collegebook.collegebookbackend.college.dto.CollegeRequestDto request);
    List<com.collegebook.collegebookbackend.college.dto.CollegeRequestDto> getAllCollegeRequests();
}
