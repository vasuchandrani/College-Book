package com.collegebook.collegebookbackend.storage.service;

import com.collegebook.collegebookbackend.auth.entity.User;
import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.storage.StorageProviderRegistry;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.dto.VideoUploadResponse;
import com.collegebook.collegebookbackend.storage.entity.Media;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.ObjectStorageProvider;
import com.collegebook.collegebookbackend.storage.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Central orchestrator service for all media operations across CollegeBook.
 * Implements the StorageService abstraction and routes storage requests
 * to the configured ObjectStorageProvider (S3 / R2) and Cloudflare Stream.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService implements StorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"
    );
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf"
    );
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;       // 10 MB
    private static final long MAX_VIDEO_SIZE = 500 * 1024 * 1024;      // 500 MB
    private static final long MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;    // 25 MB

    private final StorageProviderRegistry storageProviderRegistry;
    private final CloudflareStreamService cloudflareStreamService;
    private final MediaRepository mediaRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    @org.springframework.beans.factory.annotation.Qualifier("awsS3Client")
    private software.amazon.awssdk.services.s3.S3Client s3Client;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.collegebook.collegebookbackend.config.AwsS3Properties awsS3Properties;

    @Override
    public UploadResponseDto uploadDirect(org.springframework.web.multipart.MultipartFile file, String mediaContext, String userId) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Upload file is empty");
        }
        validateFile(file.getContentType(), file.getSize(), mediaContext);

        if (s3Client != null && awsS3Properties != null) {
            try {
                String prefix = resolvePrefix(mediaContext);
                String objectKey = buildObjectKey(prefix, file.getOriginalFilename());
                String bucket = awsS3Properties.getBucketName();
                if (bucket == null || bucket.isBlank()) {
                    bucket = "collegebook-media-240704557167-eu-north-1-an";
                }

                software.amazon.awssdk.services.s3.model.PutObjectRequest putRequest = software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(objectKey)
                        .contentType(file.getContentType())
                        .contentLength(file.getSize())
                        .build();

                s3Client.putObject(putRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));

                String accessUrl = resolveAccessUrl(objectKey, "S3");

                return UploadResponseDto.builder()
                        .uploadUrl(accessUrl)
                        .objectKey(objectKey)
                        .publicUrl(accessUrl)
                        .storageProvider("S3")
                        .build();
            } catch (Exception e) {
                log.error("Direct upload to AWS S3 failed: {}", e.getMessage(), e);
                throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload media. Please try again after some time.");
            }
        }

        throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload media. Please try again after some time.");
    }

    @Override
    public UploadResponseDto generateImageUploadUrl(String fileName, String contentType, long fileSizeBytes, String mediaContext) {
        validateFile(contentType, fileSizeBytes, mediaContext);

        String prefix = resolvePrefix(mediaContext);
        String objectKey = buildObjectKey(prefix, fileName);

        ObjectStorageProvider activeProvider = storageProviderRegistry.getActiveProvider();
        PresignedUploadResult result = activeProvider.generatePresignedUploadUrl(objectKey, contentType, fileSizeBytes);

        return UploadResponseDto.builder()
                .uploadUrl(result.getUploadUrl())
                .objectKey(result.getObjectKey())
                .publicUrl(result.getPublicUrl())
                .storageProvider(result.getProvider().name())
                .build();
    }

    @Override
    public VideoUploadResponse generateVideoUploadUrl(String fileName, String contentType, long fileSizeBytes) {
        validateVideoFile(contentType, fileSizeBytes);

        if (storageProviderRegistry.getActiveProviderType() == StorageProviderType.R2) {
            try {
                return cloudflareStreamService.createDirectUpload(fileName, contentType, fileSizeBytes);
            } catch (Exception e) {
                log.info("Cloudflare Stream unavailable, falling back to Object Storage: {}", e.getMessage());
            }
        }

        UploadResponseDto uploadResponse = generateImageUploadUrl(fileName, contentType, fileSizeBytes, "POST_VIDEO");
        return VideoUploadResponse.builder()
                .uploadUrl(uploadResponse.getUploadUrl())
                .videoId(uploadResponse.getObjectKey())
                .build();
    }

    @Override
    public UploadResponseDto generateAvatarUploadUrl(String fileName, String contentType, long fileSizeBytes, String userId) {
        validateImageFile(contentType, fileSizeBytes);

        String prefix = "avatars/" + userId;
        String objectKey = buildObjectKey(prefix, fileName);

        ObjectStorageProvider activeProvider = storageProviderRegistry.getActiveProvider();
        PresignedUploadResult result = activeProvider.generatePresignedUploadUrl(objectKey, contentType, fileSizeBytes);

        return UploadResponseDto.builder()
                .uploadUrl(result.getUploadUrl())
                .objectKey(result.getObjectKey())
                .publicUrl(result.getPublicUrl())
                .storageProvider(result.getProvider().name())
                .build();
    }

    @Override
    public String resolveAccessUrl(String objectKey, String storageProvider) {
        if (objectKey == null || objectKey.isBlank()) {
            return "";
        }

        if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
            return objectKey;
        }

        if ("CLOUDFLARE_STREAM".equalsIgnoreCase(storageProvider)) {
            return cloudflareStreamService.getPlaybackUrl(objectKey);
        }

        if ("CLOUDINARY".equalsIgnoreCase(storageProvider) || objectKey.startsWith("collegebook/")) {
            if (objectKey.contains("video") || objectKey.endsWith(".mp4") || objectKey.endsWith(".mov") || objectKey.endsWith(".webm") || objectKey.contains("collegebook/videos")) {
                return "https://res.cloudinary.com/wlayvv5n/video/upload/" + objectKey;
            }
            return "https://res.cloudinary.com/wlayvv5n/image/upload/" + objectKey;
        }

        StorageProviderType providerType = parseProviderType(storageProvider);
        ObjectStorageProvider provider = storageProviderRegistry.getProvider(providerType);

        if (providerType == StorageProviderType.S3) {
            try {
                String key = objectKey;
                if (key.startsWith("http://") || key.startsWith("https://")) {
                    int idx = key.indexOf(".amazonaws.com/");
                    if (idx != -1) {
                        key = key.substring(idx + ".amazonaws.com/".length());
                    }
                }
                String accessUrl = provider.generateAccessUrl(key, java.time.Duration.ofDays(7));
                if (accessUrl != null && !accessUrl.isBlank()) {
                    return accessUrl;
                }
            } catch (Exception e) {
                log.warn("Failed to generate presigned S3 GET URL for {}: {}", objectKey, e.getMessage());
            }
        }

        return provider.getPublicUrl(objectKey);
    }

    @Override
    public void deleteMedia(String objectKey) {
        ObjectStorageProvider activeProvider = storageProviderRegistry.getActiveProvider();
        activeProvider.deleteObject(objectKey);
    }

    @Override
    public void deleteMedia(String objectKey, String storageProvider) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }

        if ("CLOUDFLARE_STREAM".equalsIgnoreCase(storageProvider)) {
            log.info("Cloudflare Stream media deletion handled separately for videoId={}", objectKey);
            return;
        }

        StorageProviderType providerType = parseProviderType(storageProvider);
        ObjectStorageProvider provider = storageProviderRegistry.getProvider(providerType);
        provider.deleteObject(objectKey);
    }

    @Override
    @Transactional
    public void deleteAllMediaForEntity(String entityType, UUID entityId) {
        List<Media> mediaList = mediaRepository.findByEntityTypeAndEntityIdOrderByPositionAsc(entityType, entityId);
        for (Media media : mediaList) {
            deleteMedia(media.getStorageKey(), media.getStorageProvider());
        }
        mediaRepository.deleteByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * Create and persist a Media metadata record for any entity (e.g. Post, Profile).
     */
    @Transactional
    public Media createMediaRecord(User owner, String entityType, UUID entityId,
                                  String storageKey, String storageProvider,
                                  String mediaType, String contentType, Long fileSize,
                                  String originalFilename, String url, String videoId,
                                  Short position) {
        Media media = Media.builder()
                .owner(owner)
                .entityType(entityType)
                .entityId(entityId)
                .storageKey(storageKey)
                .storageProvider(storageProvider != null ? storageProvider : storageProviderRegistry.getActiveProviderType().name())
                .mediaType(mediaType != null ? mediaType : "IMAGE")
                .contentType(contentType)
                .fileSize(fileSize)
                .originalFilename(originalFilename)
                .url(url)
                .videoId(videoId)
                .position(position != null ? position : 0)
                .build();

        return mediaRepository.save(media);
    }

    private void validateFile(String contentType, long fileSizeBytes, String mediaContext) {
        if ("DOCUMENT".equalsIgnoreCase(mediaContext)) {
            validateDocumentFile(contentType, fileSizeBytes);
        } else if ("POST_VIDEO".equalsIgnoreCase(mediaContext) || (contentType != null && contentType.toLowerCase().startsWith("video/"))) {
            validateVideoFile(contentType, fileSizeBytes);
        } else {
            validateImageFile(contentType, fileSizeBytes);
        }
    }

    private void validateVideoFile(String contentType, long fileSizeBytes) {
        if (contentType == null || !ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported video type: " + contentType + ". Allowed: " + ALLOWED_VIDEO_TYPES);
        }
        if (fileSizeBytes > MAX_VIDEO_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Video too large. Maximum size: " + (MAX_VIDEO_SIZE / 1024 / 1024) + " MB");
        }
    }

    private void validateImageFile(String contentType, long fileSizeBytes) {
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported image type: " + contentType + ". Allowed: " + ALLOWED_IMAGE_TYPES);
        }
        if (fileSizeBytes > MAX_IMAGE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Image too large. Maximum size: " + (MAX_IMAGE_SIZE / 1024 / 1024) + " MB");
        }
    }

    private void validateDocumentFile(String contentType, long fileSizeBytes) {
        if (contentType == null || !ALLOWED_DOCUMENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported document type: " + contentType + ". Allowed: " + ALLOWED_DOCUMENT_TYPES);
        }
        if (fileSizeBytes > MAX_DOCUMENT_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Document too large. Maximum size: " + (MAX_DOCUMENT_SIZE / 1024 / 1024) + " MB");
        }
    }

    private String resolvePrefix(String mediaContext) {
        if (mediaContext == null) return "uploads";
        return switch (mediaContext.toUpperCase()) {
            case "POST", "POST_IMAGE" -> "posts/images";
            case "POST_VIDEO" -> "posts/videos";
            case "AVATAR" -> "avatars";
            case "DOCUMENT" -> "documents";
            default -> "uploads";
        };
    }

    private String buildObjectKey(String prefix, String fileName) {
        String sanitized = fileName != null ? fileName.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
        return prefix + "/" + UUID.randomUUID() + "/" + sanitized;
    }

    private StorageProviderType parseProviderType(String providerStr) {
        if (providerStr == null || providerStr.isBlank()) {
            return storageProviderRegistry.getActiveProviderType();
        }
        try {
            return StorageProviderType.valueOf(providerStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown storage provider string '{}', defaulting to active provider", providerStr);
            return storageProviderRegistry.getActiveProviderType();
        }
    }
}
