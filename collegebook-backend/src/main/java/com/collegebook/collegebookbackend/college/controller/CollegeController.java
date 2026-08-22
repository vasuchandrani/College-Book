package com.collegebook.collegebookbackend.college.controller;

import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;
import com.collegebook.collegebookbackend.college.dto.DepartmentDto;
import com.collegebook.collegebookbackend.college.service.CollegeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeService collegeService;

    @GetMapping
    public ResponseEntity<List<CollegeDto>> getAllColleges() {
        return ResponseEntity.ok(collegeService.getAllColleges());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CollegeDto> getCollegeBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(collegeService.getCollegeBySlug(slug));
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<CourseDto>> getCoursesByCollegeId(@PathVariable("id") UUID collegeId) {
        return ResponseEntity.ok(collegeService.getCoursesByCollegeId(collegeId));
    }

    @GetMapping("/courses/{id}/departments")
    public ResponseEntity<List<DepartmentDto>> getDepartmentsByCourseId(@PathVariable("id") UUID courseId) {
        return ResponseEntity.ok(collegeService.getDepartmentsByCourseId(courseId));
    }

    @org.springframework.web.bind.annotation.PostMapping("/request")
    public ResponseEntity<com.collegebook.collegebookbackend.college.dto.CollegeRequestDto> requestCollege(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.collegebook.collegebookbackend.college.dto.CollegeRequestDto request) {
        return ResponseEntity.ok(collegeService.requestCollege(request));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<com.collegebook.collegebookbackend.college.dto.CollegeRequestDto>> getAllCollegeRequests() {
        return ResponseEntity.ok(collegeService.getAllCollegeRequests());
    }
}
