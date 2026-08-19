package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.PostSave;
import com.collegebook.collegebookbackend.post.entity.PostSaveId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostSaveRepository extends JpaRepository<PostSave, PostSaveId> {
    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);
    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);
}
