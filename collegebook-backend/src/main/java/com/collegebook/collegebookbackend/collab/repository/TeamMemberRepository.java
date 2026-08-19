package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.TeamMember;
import com.collegebook.collegebookbackend.collab.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    List<TeamMember> findByIdTeamId(UUID teamId);
    boolean existsByIdTeamIdAndIdUserId(UUID teamId, UUID userId);
    Optional<TeamMember> findByIdTeamIdAndIdUserId(UUID teamId, UUID userId);

    @Modifying
    @Query("DELETE FROM TeamMember tm WHERE tm.id.teamId = :teamId")
    void deleteByIdTeamId(@Param("teamId") UUID teamId);

    @Modifying
    @Query("DELETE FROM TeamMember tm WHERE tm.id.teamId = :teamId AND tm.id.userId = :userId")
    void deleteByIdTeamIdAndIdUserId(@Param("teamId") UUID teamId, @Param("userId") UUID userId);
}
