package com.collegebook.collegebookbackend.post.dto;

import com.collegebook.collegebookbackend.storage.dto.MediaDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class PostResponseDto {

    private UUID id;
    private UUID authorId;
    private String authorName;
    private String authorHandle;
    private String initials;
    private String courseName;
    private String collegeName;
    private String time;
    private String content;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Builder.Default
    private List<MediaDto> media = new ArrayList<>();

    private int likes;
    private boolean liked;
    private int commentsCount;
    private boolean saved;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private Instant createdAt;
    private boolean isGlobal;
}
