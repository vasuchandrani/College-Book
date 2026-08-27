package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.PostLike;
import com.collegebook.collegebookbackend.post.entity.PostLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PostLikeRepository extends JpaRepository<PostLike, PostLikeId> {
    boolean existsByIdPostIdAndIdUserId(UUID postId, UUID userId);
    void deleteByIdPostIdAndIdUserId(UUID postId, UUID userId);

    @Query("SELECT pl.id.userId FROM PostLike pl WHERE pl.id.postId = :postId")
    List<UUID> findUserIdsByPostId(@Param("postId") UUID postId);

    @Query("SELECT pl.id.postId FROM PostLike pl WHERE pl.id.userId = :userId AND pl.id.postId IN :postIds")
    List<UUID> findLikedPostIdsByUserIdAndPostIdIn(@Param("userId") UUID userId, @Param("postIds") java.util.Collection<UUID> postIds);
}
