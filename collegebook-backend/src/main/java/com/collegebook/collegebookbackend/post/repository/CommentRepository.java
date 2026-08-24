package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID postId, Pageable pageable);
}
