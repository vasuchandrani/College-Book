package com.collegebook.collegebookbackend.storage.repository;

import com.collegebook.collegebookbackend.storage.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByEntityTypeAndEntityIdOrderByPositionAsc(String entityType, UUID entityId);

    Optional<Media> findByStorageKey(String storageKey);

    List<Media> findByOwnerIdAndEntityType(UUID ownerId, String entityType);

    void deleteByEntityTypeAndEntityId(String entityType, UUID entityId);
}
