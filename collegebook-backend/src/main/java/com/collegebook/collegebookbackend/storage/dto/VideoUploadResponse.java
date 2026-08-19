package com.collegebook.collegebookbackend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned when a Cloudflare Stream direct upload URL is generated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadResponse {

    /** TUS upload URL for direct browser upload to Cloudflare Stream. */
    private String uploadUrl;

    /** Cloudflare Stream video UID, used for playback. */
    private String videoId;
}
