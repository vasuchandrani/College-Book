package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
    Page<Post> findByCollegeId(UUID collegeId, Pageable pageable);
    Page<Post> findByAuthorId(UUID authorId, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE p.college.id = :collegeId AND LOWER(t.name) = LOWER(:tag)")
    Page<Post> findByCollegeIdAndTagName(@Param("collegeId") UUID collegeId, @Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE LOWER(t.name) = LOWER(:tag)")
    Page<Post> findByTagName(@Param("tag") String tag, Pageable pageable);

    Page<Post> findByIsGlobalTrue(Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.tags t WHERE p.isGlobal = true AND LOWER(t.name) = LOWER(:tag)")
    Page<Post> findByIsGlobalTrueAndTagName(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p JOIN PostSave ps ON ps.post.id = p.id WHERE ps.user.id = :userId ORDER BY ps.createdAt DESC")
    Page<Post> findSavedPostsByUserId(@Param("userId") UUID userId, Pageable pageable);
}
