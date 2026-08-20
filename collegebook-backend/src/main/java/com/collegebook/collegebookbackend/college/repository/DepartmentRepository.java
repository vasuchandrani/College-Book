package com.collegebook.collegebookbackend.college.repository;

import com.collegebook.collegebookbackend.college.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    List<Department> findByCourseId(UUID courseId);

    Optional<Department> findByCourseIdAndNameIgnoreCase(UUID courseId, String name);

    Optional<Department> findFirstByCourseId(UUID courseId);
}
