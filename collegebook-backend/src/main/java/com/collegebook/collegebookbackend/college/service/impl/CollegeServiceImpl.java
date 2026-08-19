package com.collegebook.collegebookbackend.college.service.impl;

import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.dto.CourseDto;
import com.collegebook.collegebookbackend.college.entity.College;
import com.collegebook.collegebookbackend.college.entity.Course;
import com.collegebook.collegebookbackend.college.repository.CollegeRepository;
import com.collegebook.collegebookbackend.college.repository.CourseRepository;
import com.collegebook.collegebookbackend.college.service.CollegeService;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CollegeServiceImpl implements CollegeService {

    private final CollegeRepository collegeRepository;
    private final CourseRepository courseRepository;
    private final com.collegebook.collegebookbackend.college.repository.CollegeRequestRepository collegeRequestRepository;

    public CollegeServiceImpl(
            CollegeRepository collegeRepository,
            CourseRepository courseRepository,
            com.collegebook.collegebookbackend.college.repository.CollegeRequestRepository collegeRequestRepository) {
        this.collegeRepository = collegeRepository;
        this.courseRepository = courseRepository;
        this.collegeRequestRepository = collegeRequestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CollegeDto> getAllColleges() {
        return collegeRepository.findAll().stream()
                .map(this::toCollegeDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CollegeDto getCollegeBySlug(String slug) {
        College college = collegeRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "College not found"));
        return toCollegeDto(college);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByCollegeId(UUID collegeId) {
        return courseRepository.findByCollegeId(collegeId).stream()
                .map(this::toCourseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public com.collegebook.collegebookbackend.college.dto.CollegeRequestDto requestCollege(com.collegebook.collegebookbackend.college.dto.CollegeRequestDto request) {
        com.collegebook.collegebookbackend.college.entity.CollegeRequest entity = com.collegebook.collegebookbackend.college.entity.CollegeRequest.builder()
                .collegeName(request.getCollegeName().trim())
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .state(request.getState() != null ? request.getState().trim() : null)
                .requesterEmail(request.getRequesterEmail().trim().toLowerCase())
                .requesterName(request.getRequesterName() != null ? request.getRequesterName().trim() : null)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .status("PENDING")
                .build();

        entity = collegeRequestRepository.save(entity);
        request.setId(entity.getId());
        request.setStatus(entity.getStatus());
        request.setCreatedAt(entity.getCreatedAt());
        return request;
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.collegebook.collegebookbackend.college.dto.CollegeRequestDto> getAllCollegeRequests() {
        return collegeRequestRepository.findAll().stream()
                .map(r -> com.collegebook.collegebookbackend.college.dto.CollegeRequestDto.builder()
                        .id(r.getId())
                        .collegeName(r.getCollegeName())
                        .city(r.getCity())
                        .state(r.getState())
                        .requesterEmail(r.getRequesterEmail())
                        .requesterName(r.getRequesterName())
                        .status(r.getStatus())
                        .notes(r.getNotes())
                        .createdAt(r.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private CollegeDto toCollegeDto(College c) {
        CollegeDto dto = new CollegeDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setShortName(c.getShortName());
        dto.setSlug(c.getSlug());
        dto.setCity(c.getCity());
        dto.setState(c.getState());
        dto.setLogoUrl(c.getLogoUrl());
        dto.setEmailDomains(c.getEmailDomains());
        return dto;
    }

    private CourseDto toCourseDto(Course c) {
        CourseDto dto = new CourseDto();
        dto.setId(c.getId());
        dto.setCollegeId(c.getCollege().getId());
        dto.setName(c.getName());
        dto.setShortName(c.getShortName());
        dto.setDurationYears((int) c.getDurationYears());
        return dto;
    }
}
