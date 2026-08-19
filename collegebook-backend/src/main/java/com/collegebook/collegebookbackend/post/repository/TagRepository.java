package com.collegebook.collegebookbackend.post.repository;

import com.collegebook.collegebookbackend.post.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {
    Optional<Tag> findByNameIgnoreCase(String name);
    List<Tag> findByNameInIgnoreCase(List<String> names);
}
