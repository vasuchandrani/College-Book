package com.collegebook.collegebookbackend.college.repository;

import com.collegebook.collegebookbackend.college.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {

    List<Branch> findByCourseId(UUID courseId);

    Optional<Branch> findByCourseIdAndNameIgnoreCase(UUID courseId, String name);

    Optional<Branch> findFirstByCourseId(UUID courseId);
}
