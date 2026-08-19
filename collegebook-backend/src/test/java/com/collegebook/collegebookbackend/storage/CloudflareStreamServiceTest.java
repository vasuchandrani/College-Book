package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.service.CloudflareStreamService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
public class CloudflareStreamServiceTest {

    private CloudflareProperties cloudflareProperties;
    private CloudflareStreamService streamService;

    @BeforeEach
    void setUp() {
        cloudflareProperties = new CloudflareProperties();
        cloudflareProperties.getStream().setAccountId("test-stream-account-id");
        cloudflareProperties.getStream().setApiToken("test-token");

        streamService = new CloudflareStreamService(cloudflareProperties, new ObjectMapper());
    }

    @Test
    void testGetPlaybackUrl() {
        String url = streamService.getPlaybackUrl("test-video-uid");
        assertNotNull(url);
        assertTrue(url.contains("customer-test-stream-account-id.cloudflarestream.com/test-video-uid/iframe"));
    }

    @Test
    void testGetStreamUrl() {
        String url = streamService.getStreamUrl("test-video-uid");
        assertNotNull(url);
        assertTrue(url.contains("customer-test-stream-account-id.cloudflarestream.com/test-video-uid/manifest/video.m3u8"));
    }

    @Test
    void testInvalidVideoTypeThrowsException() {
        AppException ex = assertThrows(AppException.class, () ->
                streamService.createDirectUpload("file.txt", "text/plain", 1024)
        );
        assertEquals(ErrorCode.INVALID_FILE_TYPE, ex.getErrorCode());
    }

    @Test
    void testVideoTooLargeThrowsException() {
        AppException ex = assertThrows(AppException.class, () ->
                streamService.createDirectUpload("huge.mp4", "video/mp4", 600L * 1024 * 1024)
        );
        assertEquals(ErrorCode.FILE_TOO_LARGE, ex.getErrorCode());
    }
}
