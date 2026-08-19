package com.collegebook.collegebookbackend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a media reference sent during post creation.
 * The frontend sends these after completing direct uploads to R2 or Stream.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaKeyDto {

    /** R2 object key or a placeholder for video. */
    private String objectKey;

    /** IMAGE or VIDEO. */
    private String mediaType;

    /** R2 or CLOUDFLARE_STREAM. */
    private String storageProvider;

    /** Cloudflare Stream video UID (only for VIDEO type). */
    private String videoId;

    /** Public URL for the media (for R2 images). */
    private String url;
}
