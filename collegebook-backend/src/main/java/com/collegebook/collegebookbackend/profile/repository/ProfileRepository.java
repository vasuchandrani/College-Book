package com.collegebook.collegebookbackend.profile.repository;

import com.collegebook.collegebookbackend.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUserId(UUID userId);
    Optional<Profile> findByHandleIgnoreCase(String handle);
    Optional<Profile> findFirstByFullNameIgnoreCase(String fullName);
    boolean existsByHandleIgnoreCase(String handle);

    @Query("SELECT p.handle FROM Profile p WHERE p.handle IS NOT NULL")
    List<String> findAllHandles();
}
