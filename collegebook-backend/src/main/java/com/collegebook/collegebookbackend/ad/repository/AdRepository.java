package com.collegebook.collegebookbackend.ad.repository;

import com.collegebook.collegebookbackend.ad.entity.Ad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AdRepository extends JpaRepository<Ad, UUID> {
    List<Ad> findByIsActiveTrue();
}
