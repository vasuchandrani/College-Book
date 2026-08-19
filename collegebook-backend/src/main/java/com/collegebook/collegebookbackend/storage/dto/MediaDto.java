package com.collegebook.collegebookbackend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for returning media metadata in post responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaDto {

    private UUID id;
    private String mediaType;
    private String url;
    private String thumbnailUrl;
    private String videoId;
    private Integer width;
    private Integer height;
    private Integer durationSeconds;
    private int position;
}
