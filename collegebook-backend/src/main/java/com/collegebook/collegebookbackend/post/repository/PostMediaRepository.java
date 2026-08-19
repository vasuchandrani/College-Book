package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, UUID> {

    List<PostMedia> findByPostIdOrderByPositionAsc(UUID postId);

    void deleteByPostId(UUID postId);
}
