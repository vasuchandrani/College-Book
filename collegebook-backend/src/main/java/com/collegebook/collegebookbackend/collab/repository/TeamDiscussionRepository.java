package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.TeamDiscussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeamDiscussionRepository extends JpaRepository<TeamDiscussion, UUID> {

    Page<TeamDiscussion> findByTeamIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID teamId, Pageable pageable);

    long countByTeamIdAndDeletedAtIsNull(UUID teamId);
}
