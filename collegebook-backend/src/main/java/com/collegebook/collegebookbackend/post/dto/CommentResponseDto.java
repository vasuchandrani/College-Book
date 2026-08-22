package com.collegebook.collegebookbackend.post.dto;

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
public class CommentResponseDto {

    private UUID id;
    private UUID postId;
    private UUID authorId;
    private String authorName;
    private String initials;
    private String body;
    private String time;
    private Instant createdAt;
}
