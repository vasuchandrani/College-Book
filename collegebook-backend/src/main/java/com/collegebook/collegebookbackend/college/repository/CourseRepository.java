package com.collegebook.collegebookbackend.college.repository;

import com.collegebook.collegebookbackend.college.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByCollegeId(UUID collegeId);
}
