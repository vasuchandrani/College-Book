package com.collegebook.collegebookbackend.chat.repository;

import com.collegebook.collegebookbackend.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender s JOIN FETCH s.college WHERE m.team.id = :teamId AND m.deletedAt IS NULL ORDER BY m.createdAt ASC")
    List<ChatMessage> findRecentMessagesByTeamId(@Param("teamId") UUID teamId, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender s JOIN FETCH s.college WHERE m.team.id = :teamId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC")
    Page<ChatMessage> findPagedMessagesByTeamId(@Param("teamId") UUID teamId, Pageable pageable);

    Optional<ChatMessage> findByIdAndTeamIdAndDeletedAtIsNull(UUID id, UUID teamId);

    long countByTeamIdAndDeletedAtIsNull(UUID teamId);
}
