package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.TeamStar;
import com.collegebook.collegebookbackend.collab.entity.TeamStarId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TeamStarRepository extends JpaRepository<TeamStar, TeamStarId> {
    boolean existsByIdTeamIdAndIdUserId(UUID teamId, UUID userId);
    void deleteByIdTeamIdAndIdUserId(UUID teamId, UUID userId);

    @Modifying
    @Query("DELETE FROM TeamStar ts WHERE ts.id.teamId = :teamId")
    void deleteByIdTeamId(@Param("teamId") UUID teamId);
}
