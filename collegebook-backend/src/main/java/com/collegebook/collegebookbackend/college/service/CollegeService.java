package com.collegebook.collegebookbackend.college.service;

import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;
import com.collegebook.collegebookbackend.college.dto.BranchDto;

import java.util.List;
import java.util.UUID;

public interface CollegeService {
    List<CollegeDto> getAllColleges();
    CollegeDto getCollegeBySlug(String slug);
    List<CourseDto> getCoursesByCollegeId(UUID collegeId);
    List<BranchDto> getBranchsByCourseId(UUID courseId);
    com.collegebook.collegebookbackend.college.dto.CollegeRequestDto requestCollege(com.collegebook.collegebookbackend.college.dto.CollegeRequestDto request);
    List<com.collegebook.collegebookbackend.college.dto.CollegeRequestDto> getAllCollegeRequests();
}
