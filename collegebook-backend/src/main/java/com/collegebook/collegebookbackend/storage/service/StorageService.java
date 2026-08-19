package com.collegebook.collegebookbackend.storage.service;

import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.dto.VideoUploadResponse;

import java.util.UUID;

/**
 * Abstraction over media storage operations.
 * Routes images/files to the active ObjectStorageProvider (S3 / R2) and videos to Cloudflare Stream.
 */
public interface StorageService {

    /**
     * Generate a presigned URL for uploading an image or file to the active storage provider.
     */
    UploadResponseDto generateImageUploadUrl(String fileName, String contentType, long fileSizeBytes, String mediaContext);

    /**
     * Generate a direct-upload URL for videos (Cloudflare Stream).
     */
    VideoUploadResponse generateVideoUploadUrl(String fileName, String contentType, long fileSizeBytes);

    /**
     * Generate a presigned URL specifically for avatar uploads.
     */
    UploadResponseDto generateAvatarUploadUrl(String fileName, String contentType, long fileSizeBytes, String userId);

    /**
     * Resolve the public or access URL for a stored object key and its provider.
     */
    String resolveAccessUrl(String objectKey, String storageProvider);

    /**
     * Delete media from storage by object key using the active provider.
     */
    void deleteMedia(String objectKey);

    /**
     * Delete media from storage by object key and specific provider.
     */
    void deleteMedia(String objectKey, String storageProvider);

    /**
     * Directly upload a media file via backend (e.g. to Cloudinary).
     */
    UploadResponseDto uploadDirect(org.springframework.web.multipart.MultipartFile file, String mediaContext, String userId);

    /**
     * Delete all media assets attached to a given entity (e.g. POST, PROFILE).
     */
    void deleteAllMediaForEntity(String entityType, UUID entityId);
}
