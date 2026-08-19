package com.collegebook.collegebookbackend.ad.repository;

import com.collegebook.collegebookbackend.ad.entity.AdLike;
import com.collegebook.collegebookbackend.ad.entity.AdLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AdLikeRepository extends JpaRepository<AdLike, AdLikeId> {
    boolean existsByIdAdIdAndIdUserId(UUID adId, UUID userId);
    void deleteByIdAdIdAndIdUserId(UUID adId, UUID userId);
}
