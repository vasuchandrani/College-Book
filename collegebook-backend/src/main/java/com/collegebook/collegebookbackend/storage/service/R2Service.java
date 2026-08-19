package com.collegebook.collegebookbackend.storage.service;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Handles Cloudflare R2 operations: presigned URL generation and object deletion.
 * R2 is S3-compatible, so we use the AWS SDK S3 client and presigner.
 */
@Slf4j
@Service
public class R2Service {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final Set<String> ALLOWED_DOCUMENT_TYPES = Set.of(
            "application/pdf"
    );
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024;       // 10 MB
    private static final long MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;    // 25 MB
    private static final Duration PRESIGN_EXPIRY = Duration.ofMinutes(15);

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final CloudflareProperties cloudflareProperties;

    public R2Service(
            @org.springframework.beans.factory.annotation.Qualifier("r2S3Presigner") S3Presigner s3Presigner,
            @org.springframework.beans.factory.annotation.Qualifier("r2S3Client") S3Client s3Client,
            CloudflareProperties cloudflareProperties) {
        this.s3Presigner = s3Presigner;
        this.s3Client = s3Client;
        this.cloudflareProperties = cloudflareProperties;
    }

    /**
     * Generate a presigned PUT URL for uploading an image to R2.
     */
    public UploadResponseDto generatePresignedUploadUrl(String fileName, String contentType, long fileSizeBytes, String prefix) {
        validateImageFile(contentType, fileSizeBytes);

        String objectKey = buildObjectKey(prefix, fileName);
        String bucket = cloudflareProperties.getR2().getBucketName();

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .contentLength(fileSizeBytes)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_EXPIRY)
                .putObjectRequest(putRequest)
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

        String publicUrl = buildPublicUrl(objectKey);

        log.info("Generated presigned R2 upload URL for key={}", objectKey);

        return UploadResponseDto.builder()
                .uploadUrl(presigned.url().toString())
                .objectKey(objectKey)
                .publicUrl(publicUrl)
                .build();
    }

    /**
     * Generate a presigned PUT URL for uploading a document (PDF etc.) to R2.
     */
    public UploadResponseDto generateDocumentUploadUrl(String fileName, String contentType, long fileSizeBytes, String prefix) {
        validateDocumentFile(contentType, fileSizeBytes);

        String objectKey = buildObjectKey(prefix, fileName);
        String bucket = cloudflareProperties.getR2().getBucketName();

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(contentType)
                .contentLength(fileSizeBytes)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_EXPIRY)
                .putObjectRequest(putRequest)
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

        return UploadResponseDto.builder()
                .uploadUrl(presigned.url().toString())
                .objectKey(objectKey)
                .publicUrl(buildPublicUrl(objectKey))
                .build();
    }

    /**
     * Delete an object from R2 by its key.
     */
    public void deleteObject(String objectKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(cloudflareProperties.getR2().getBucketName())
                    .key(objectKey)
                    .build());
            log.info("Deleted R2 object: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete R2 object {}: {}", objectKey, e.getMessage());
        }
    }

    /**
     * Build the public URL for an R2 object.
     */
    public String buildPublicUrl(String objectKey) {
        String publicUrl = cloudflareProperties.getR2().getPublicUrl();
        if (publicUrl != null && !publicUrl.isBlank()) {
            return publicUrl.endsWith("/") ? publicUrl + objectKey : publicUrl + "/" + objectKey;
        }
        return objectKey;
    }

    private String buildObjectKey(String prefix, String fileName) {
        String sanitized = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return prefix + "/" + UUID.randomUUID() + "/" + sanitized;
    }

    private void validateImageFile(String contentType, long fileSizeBytes) {
        if (!ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported image type: " + contentType + ". Allowed: " + ALLOWED_IMAGE_TYPES);
        }
        if (fileSizeBytes > MAX_IMAGE_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Image too large. Maximum size: " + (MAX_IMAGE_SIZE / 1024 / 1024) + " MB");
        }
    }

    private void validateDocumentFile(String contentType, long fileSizeBytes) {
        if (!ALLOWED_DOCUMENT_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE,
                    "Unsupported document type: " + contentType + ". Allowed: " + ALLOWED_DOCUMENT_TYPES);
        }
        if (fileSizeBytes > MAX_DOCUMENT_SIZE) {
            throw new AppException(ErrorCode.FILE_TOO_LARGE,
                    "Document too large. Maximum size: " + (MAX_DOCUMENT_SIZE / 1024 / 1024) + " MB");
        }
    }
}
