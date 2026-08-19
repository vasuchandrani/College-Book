package com.collegebook.collegebookbackend.storage.service;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.dto.VideoUploadResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Set;

/**
 * Handles Cloudflare Stream operations for on-demand video uploads.
 * Uses the Cloudflare Stream direct creator upload API (TUS-based)
 * so large videos upload directly from the browser to Stream.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudflareStreamService {

    private static final String STREAM_API_BASE = "https://api.cloudflare.com/client/v4/accounts";
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"
    );
    private static final long MAX_VIDEO_SIZE = 500L * 1024 * 1024; // 500 MB

    private final CloudflareProperties cloudflareProperties;
    private final ObjectMapper objectMapper;

    /**
     * Create a Cloudflare Stream direct creator upload.
     * Returns a TUS upload URL that the frontend uses to upload the video directly.
     */
    public VideoUploadResponse createDirectUpload(String fileName, String contentType, long fileSizeBytes) {
        validateVideoFile(contentType, fileSizeBytes);

        CloudflareProperties.Stream stream = cloudflareProperties.getStream();
        String url = STREAM_API_BASE + "/" + stream.getAccountId() + "/stream?direct_user=true";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + stream.getApiToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Tus-Resumable", "1.0.0");
        headers.set("Upload-Length", String.valueOf(fileSizeBytes));
        headers.set("Upload-Metadata", "name " + encodeBase64(fileName) + ",requiresignedurls");

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // The direct upload URL comes in the Location header for TUS protocol
            String uploadUrl = response.getHeaders().getFirst("Location");
            // Extract video UID from the Stream-Media-Id header or response body
            String videoId = response.getHeaders().getFirst("stream-media-id");

            if (videoId == null && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode result = root.path("result");
                if (result.has("uid")) {
                    videoId = result.get("uid").asText();
                }
            }

            if (uploadUrl == null || videoId == null) {
                log.error("Cloudflare Stream direct upload creation failed — missing uploadUrl or videoId. Response: {}", response.getBody());
                throw new AppException(ErrorCode.VIDEO_UPLOAD_FAILED, "Failed to create video upload session");
            }

            log.info("Created Cloudflare Stream direct upload: videoId={}", videoId);

            return VideoUploadResponse.builder()
                    .uploadUrl(uploadUrl)
                    .videoId(videoId)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to create Cloudflare Stream direct upload: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.VIDEO_UPLOAD_FAILED, "Failed to initiate video upload: " + e.getMessage());
        }
    }

    /**
     * Build the Stream iframe playback URL for a given video ID.
     */
    public String getPlaybackUrl(String videoId) {
        return "https://customer-" + cloudflareProperties.getStream().getAccountId() + ".cloudflarestream.com/" + videoId + "/iframe";
    }

    /**
     * Build the Stream HLS/DASH playback URL for a given video ID.
     */
    public String getStreamUrl(String videoId) {
        return "https://customer-" + cloudflareProperties.getStream().getAccountId() + ".cloudflarestream.com/" + videoId + "/manifest/video.m3u8";
    }

    private void validateVideoFile(String contentType, long fileSizeBytes) {
        if (!ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported video type: " + contentType + ". Allowed: " + ALLOWED_VIDEO_TYPES);
        }
        if (fileSizeBytes > MAX_VIDEO_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Video too large. Maximum size: " + (MAX_VIDEO_SIZE / 1024 / 1024) + " MB");
        }
    }

    private String encodeBase64(String value) {
        return java.util.Base64.getEncoder().encodeToString(value.getBytes());
    }
}
