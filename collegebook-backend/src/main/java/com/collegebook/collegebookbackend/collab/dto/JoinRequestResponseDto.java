package com.collegebook.collegebookbackend.collab.dto;

import com.collegebook.collegebookbackend.collab.entity.JoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestResponseDto {

    private UUID id;
    private UUID teamId;
    private String teamTitle;
    private UUID applicantId;
    private String applicantName;
    private String role;
    private String message;
    private JoinRequestStatus status;
    private Instant createdAt;
}
