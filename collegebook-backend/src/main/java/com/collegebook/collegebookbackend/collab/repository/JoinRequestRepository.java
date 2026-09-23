package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.JoinRequest;
import com.collegebook.collegebookbackend.collab.entity.JoinRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, UUID> {
    List<JoinRequest> findByApplicantIdOrderByCreatedAtDesc(UUID applicantId);
    Page<JoinRequest> findByApplicantIdOrderByCreatedAtDesc(UUID applicantId, Pageable pageable);
    List<JoinRequest> findByTeamIdOrderByCreatedAtDesc(UUID teamId);
    List<JoinRequest> findByTeamOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    Page<JoinRequest> findByTeamOwnerIdOrderByCreatedAtDesc(UUID ownerId, Pageable pageable);
    boolean existsByTeamIdAndApplicantIdAndStatus(UUID teamId, UUID applicantId, JoinRequestStatus status);
    long countByTeamIdAndStatus(UUID teamId, JoinRequestStatus status);

    @Modifying
    @Query("DELETE FROM JoinRequest jr WHERE jr.team.id = :teamId")
    void deleteByTeamId(@Param("teamId") UUID teamId);
}
