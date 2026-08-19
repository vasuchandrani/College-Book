package com.collegebook.collegebookbackend.auth.repository;

import com.collegebook.collegebookbackend.auth.entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, UUID> {
    Optional<EmailOtp> findTopByEmailAndPurposeAndConsumedAtIsNullOrderByCreatedAtDesc(String email, String purpose);

    Optional<EmailOtp> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);

    long countByEmailAndCreatedAtAfter(String email, Instant since);

    List<EmailOtp> findByEmailAndPurposeAndConsumedAtIsNull(String email, String purpose);
}
