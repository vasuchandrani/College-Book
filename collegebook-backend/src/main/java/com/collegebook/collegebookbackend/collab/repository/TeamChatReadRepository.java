package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.TeamChatRead;
import com.collegebook.collegebookbackend.collab.entity.TeamChatReadId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamChatReadRepository extends JpaRepository<TeamChatRead, TeamChatReadId> {

    Optional<TeamChatRead> findByIdTeamIdAndIdUserId(UUID teamId, UUID userId);

    @Query("SELECT r FROM TeamChatRead r WHERE r.id.userId = :userId")
    List<TeamChatRead> findByUserId(@Param("userId") UUID userId);
}
