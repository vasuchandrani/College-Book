package com.collegebook.collegebookbackend.college.repository;

import com.collegebook.collegebookbackend.college.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CollegeRepository extends JpaRepository<College, UUID> {
    Optional<College> findBySlug(String slug);
}
