package com.collegebook.collegebookbackend.college.repository;

import com.collegebook.collegebookbackend.college.entity.CollegeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CollegeRequestRepository extends JpaRepository<CollegeRequest, UUID> {
    List<CollegeRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<CollegeRequest> findByRequesterEmailIgnoreCase(String requesterEmail);
}
