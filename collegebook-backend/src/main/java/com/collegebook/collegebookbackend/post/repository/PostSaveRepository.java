package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.PostSave;
import com.collegebook.collegebookbackend.post.entity.PostSaveId;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostSaveRepository extends JpaRepository<PostSave, PostSaveId> {
    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);
    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);

    @Query("SELECT ps.id.userId FROM PostSave ps WHERE ps.id.postId = :postId")
    List<UUID> findUserIdsByPostId(@Param("postId") UUID postId);
}
