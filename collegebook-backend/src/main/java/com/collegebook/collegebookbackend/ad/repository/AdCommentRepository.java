package com.collegebook.collegebookbackend.ad.repository;

import com.collegebook.collegebookbackend.ad.entity.AdComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdCommentRepository extends JpaRepository<AdComment, UUID> {
    Page<AdComment> findByAdIdOrderByCreatedAtAsc(UUID adId, Pageable pageable);
}
