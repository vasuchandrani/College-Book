package com.collegebook.collegebookbackend.collab.repository;

import com.collegebook.collegebookbackend.collab.entity.Team;
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    Page<Team> findByCollegeId(UUID collegeId, Pageable pageable);
    Page<Team> findByCollegeIdAndCompletedFalse(UUID collegeId, Pageable pageable);
    Page<Team> findByCollegeIdAndType(UUID collegeId, TeamType type, Pageable pageable);
    Page<Team> findByCollegeIdAndTypeAndCompletedFalse(UUID collegeId, TeamType type, Pageable pageable);
    Page<Team> findByOwnerId(UUID ownerId, Pageable pageable);

    @Query("SELECT DISTINCT t FROM Team t JOIN TeamMember tm ON tm.team.id = t.id WHERE tm.user.id = :userId ORDER BY t.createdAt DESC")
    List<Team> findMyTeams(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT t FROM Team t JOIN TeamMember tm ON tm.team.id = t.id WHERE tm.user.id = :userId AND t.type = :type ORDER BY t.createdAt DESC")
    List<Team> findMyTeamsByType(@Param("userId") UUID userId, @Param("type") TeamType type);

    List<Team> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    List<Team> findByOwnerIdAndTypeOrderByCreatedAtDesc(UUID ownerId, TeamType type);

    @Query("SELECT t FROM Team t JOIN TeamStar ts ON ts.team.id = t.id WHERE ts.user.id = :userId ORDER BY ts.createdAt DESC")
    List<Team> findStarredTeams(@Param("userId") UUID userId);
}
