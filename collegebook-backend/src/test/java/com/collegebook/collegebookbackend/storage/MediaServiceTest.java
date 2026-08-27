package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.dto.VideoUploadResponse;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.ObjectStorageProvider;
import com.collegebook.collegebookbackend.storage.repository.MediaRepository;
import com.collegebook.collegebookbackend.storage.service.CloudflareStreamService;
import com.collegebook.collegebookbackend.storage.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class MediaServiceTest {

    @Mock
    private StorageProviderRegistry storageProviderRegistry;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private CloudflareStreamService cloudflareStreamService;
    @Mock
    private ObjectStorageProvider mockStorageProvider;

    private MediaService mediaService;

    @BeforeEach
    void setUp() {
        mediaService = new MediaService(storageProviderRegistry, cloudflareStreamService, mediaRepository);
    }

    @Test
    void testGenerateImageUploadUrlSuccess() {
        when(storageProviderRegistry.getActiveProvider()).thenReturn(mockStorageProvider);
        when(mockStorageProvider.generatePresignedUploadUrl(anyString(), eq("image/jpeg"), anyLong()))
                .thenReturn(PresignedUploadResult.builder()
                        .uploadUrl("https://s3.amazonaws.com/presigned-put")
                        .objectKey("posts/images/uuid_test.jpg")
                        .publicUrl("https://collegebook.s3.ap-south-1.amazonaws.com/posts/images/uuid_test.jpg")
                        .provider(StorageProviderType.S3)
                        .build());

        UploadResponseDto response = mediaService.generateImageUploadUrl("test.jpg", "image/jpeg", 1024 * 100, "POST_IMAGE");

        assertNotNull(response);
        assertEquals("https://s3.amazonaws.com/presigned-put", response.getUploadUrl());
        assertTrue(response.getObjectKey().contains("posts/images/"));
        assertEquals("S3", response.getStorageProvider());
    }

    @Test
    void testGenerateImageUploadUrlRejectsInvalidType() {
        AppException ex = assertThrows(AppException.class, () ->
                mediaService.generateImageUploadUrl("malicious.exe", "application/x-msdownload", 1024, "POST_IMAGE")
        );
        assertEquals(ErrorCode.INVALID_FILE_TYPE, ex.getErrorCode());
    }

    @Test
    void testGenerateImageUploadUrlRejectsTooLarge() {
        AppException ex = assertThrows(AppException.class, () ->
                mediaService.generateImageUploadUrl("huge.png", "image/png", 50 * 1024 * 1024, "POST_IMAGE")
        );
        assertEquals(ErrorCode.FILE_TOO_LARGE, ex.getErrorCode());
    }

    @Test
    void testGenerateAvatarUploadUrlSuccess() {
        when(storageProviderRegistry.getActiveProvider()).thenReturn(mockStorageProvider);
        when(mockStorageProvider.generatePresignedUploadUrl(anyString(), eq("image/png"), anyLong()))
                .thenReturn(PresignedUploadResult.builder()
                        .uploadUrl("https://s3.amazonaws.com/avatar-presigned")
                        .objectKey("avatars/user-123/uuid_avatar.png")
                        .publicUrl("https://cdn.collegebook.com/avatars/user-123/uuid_avatar.png")
                        .provider(StorageProviderType.S3)
                        .build());

        UploadResponseDto response = mediaService.generateAvatarUploadUrl("avatar.png", "image/png", 50000, "user-123");

        assertNotNull(response);
        assertTrue(response.getObjectKey().contains("avatars/user-123/"));
    }

    @Test
    void testGenerateVideoUploadUrlGeneratesS3PresignedUrl() {
        when(storageProviderRegistry.getActiveProviderType()).thenReturn(StorageProviderType.S3);
        when(storageProviderRegistry.getActiveProvider()).thenReturn(mockStorageProvider);
        when(mockStorageProvider.generatePresignedUploadUrl(anyString(), eq("video/mp4"), anyLong()))
                .thenReturn(PresignedUploadResult.builder()
                        .uploadUrl("https://s3.amazonaws.com/presigned-video-put")
                        .objectKey("posts/videos/uuid_test.mp4")
                        .publicUrl("https://collegebook.s3.ap-south-1.amazonaws.com/posts/videos/uuid_test.mp4")
                        .provider(StorageProviderType.S3)
                        .build());

        VideoUploadResponse response = mediaService.generateVideoUploadUrl("demo.mp4", "video/mp4", 5 * 1024 * 1024);

        assertNotNull(response);
        assertEquals("https://s3.amazonaws.com/presigned-video-put", response.getUploadUrl());
        assertTrue(response.getVideoId().contains("posts/videos/"));
    }

    @Test
    void testResolveAccessUrlStream() {
        when(cloudflareStreamService.getPlaybackUrl("video-123"))
                .thenReturn("https://customer.cloudflarestream.com/video-123/iframe");

        String url = mediaService.resolveAccessUrl("video-123", "CLOUDFLARE_STREAM");
        assertEquals("https://customer.cloudflarestream.com/video-123/iframe", url);
    }

    @Test
    void testResolveAccessUrlS3() {
        when(storageProviderRegistry.getProvider(StorageProviderType.S3)).thenReturn(mockStorageProvider);
        when(mockStorageProvider.getPublicUrl("posts/images/abc.jpg"))
                .thenReturn("https://s3.amazonaws.com/bucket/posts/images/abc.jpg");

        String url = mediaService.resolveAccessUrl("posts/images/abc.jpg", "S3");
        assertEquals("https://s3.amazonaws.com/bucket/posts/images/abc.jpg", url);
    }

    @Test
    void testDeleteMediaDelegatesToProvider() {
        when(storageProviderRegistry.getProvider(StorageProviderType.S3)).thenReturn(mockStorageProvider);

        mediaService.deleteMedia("posts/images/to-delete.jpg", "S3");
        verify(mockStorageProvider).deleteObject("posts/images/to-delete.jpg");
    }
}
