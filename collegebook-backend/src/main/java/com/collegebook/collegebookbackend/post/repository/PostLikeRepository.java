package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.PostLike;
import com.collegebook.collegebookbackend.post.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);
    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);
}
