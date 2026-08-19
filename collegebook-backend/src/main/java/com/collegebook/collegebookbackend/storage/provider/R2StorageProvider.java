package com.collegebook.collegebookbackend.storage.provider;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.model.ObjectMetadata;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.model.StoredObjectSummary;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Cloudflare R2 implementation of ObjectStorageProvider.
 * Connects via Cloudflare's S3-compatible API.
 */
@Slf4j
@Component("r2StorageProvider")
public class R2StorageProvider implements ObjectStorageProvider {

    private static final Duration DEFAULT_PRESIGN_EXPIRY = Duration.ofMinutes(15);

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final CloudflareProperties cloudflareProperties;

    public R2StorageProvider(
            @Qualifier("r2S3Client") S3Client s3Client,
            @Qualifier("r2S3Presigner") S3Presigner s3Presigner,
            CloudflareProperties cloudflareProperties) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.cloudflareProperties = cloudflareProperties;
    }

    @Override
    public StorageProviderType getProviderType() {
        return StorageProviderType.R2;
    }

    @Override
    public PresignedUploadResult generatePresignedUploadUrl(String objectKey, String contentType, long fileSizeBytes) {
        String bucket = getBucketName();

        PutObjectRequest.Builder putRequestBuilder = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey);

        if (contentType != null && !contentType.isBlank()) {
            putRequestBuilder.contentType(contentType);
        }
        if (fileSizeBytes > 0) {
            putRequestBuilder.contentLength(fileSizeBytes);
        }

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(DEFAULT_PRESIGN_EXPIRY)
                .putObjectRequest(putRequestBuilder.build())
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);
        String publicUrl = getPublicUrl(objectKey);

        log.info("Generated Cloudflare R2 presigned PUT URL for key={}", objectKey);

        return PresignedUploadResult.builder()
                .uploadUrl(presigned.url().toString())
                .objectKey(objectKey)
                .publicUrl(publicUrl)
                .provider(StorageProviderType.R2)
                .build();
    }

    @Override
    public String generateAccessUrl(String objectKey, Duration expiry) {
        Duration duration = expiry != null ? expiry : Duration.ofHours(1);
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(getBucketName())
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
        return presigned.url().toString();
    }

    @Override
    public String getPublicUrl(String objectKey) {
        String publicUrl = cloudflareProperties.getR2().getPublicUrl();
        if (publicUrl != null && !publicUrl.isBlank()) {
            return publicUrl.endsWith("/") ? publicUrl + objectKey : publicUrl + "/" + objectKey;
        }
        return objectKey;
    }

    @Override
    public void deleteObject(String objectKey) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .build());
            log.info("Deleted R2 object: key={}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete R2 object key={}: {}", objectKey, e.getMessage());
        }
    }

    @Override
    public void deleteObjects(List<String> objectKeys) {
        if (objectKeys == null || objectKeys.isEmpty()) {
            return;
        }
        try {
            List<ObjectIdentifier> identifiers = objectKeys.stream()
                    .map(k -> ObjectIdentifier.builder().key(k).build())
                    .collect(Collectors.toList());

            Delete delete = Delete.builder().objects(identifiers).build();
            s3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(getBucketName())
                    .delete(delete)
                    .build());
            log.info("Batch deleted {} R2 objects", objectKeys.size());
        } catch (Exception e) {
            log.error("Failed to batch delete R2 objects: {}", e.getMessage());
        }
    }

    @Override
    public boolean objectExists(String objectKey) {
        try {
            s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.warn("Error checking R2 existence for key={}: {}", objectKey, e.getMessage());
            return false;
        }
    }

    @Override
    public ObjectMetadata getObjectMetadata(String objectKey) {
        try {
            HeadObjectResponse response = s3Client.headObject(HeadObjectRequest.builder()
                    .bucket(getBucketName())
                    .key(objectKey)
                    .build());

            return ObjectMetadata.builder()
                    .objectKey(objectKey)
                    .contentType(response.contentType())
                    .contentLength(response.contentLength())
                    .etag(response.eTag())
                    .lastModified(response.lastModified())
                    .storageProvider(StorageProviderType.R2)
                    .userMetadata(response.metadata())
                    .build();
        } catch (NoSuchKeyException e) {
            throw new AppException(ErrorCode.NOT_FOUND, "Media object not found: " + objectKey);
        } catch (Exception e) {
            log.error("Failed to retrieve R2 metadata for key={}: {}", objectKey, e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to retrieve media metadata");
        }
    }

    @Override
    public void copyObject(String sourceKey, String destinationKey) {
        try {
            String bucket = getBucketName();
            s3Client.copyObject(CopyObjectRequest.builder()
                    .sourceBucket(bucket)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucket)
                    .destinationKey(destinationKey)
                    .build());
            log.info("Copied R2 object from {} to {}", sourceKey, destinationKey);
        } catch (Exception e) {
            log.error("Failed to copy R2 object from {} to {}: {}", sourceKey, destinationKey, e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to copy media object");
        }
    }

    @Override
    public List<StoredObjectSummary> listObjects(String prefix, int maxKeys) {
        try {
            ListObjectsV2Request.Builder requestBuilder = ListObjectsV2Request.builder()
                    .bucket(getBucketName())
                    .maxKeys(maxKeys > 0 ? maxKeys : 1000);

            if (prefix != null && !prefix.isBlank()) {
                requestBuilder.prefix(prefix);
            }

            ListObjectsV2Response response = s3Client.listObjectsV2(requestBuilder.build());
            return response.contents().stream()
                    .map(s3Object -> StoredObjectSummary.builder()
                            .objectKey(s3Object.key())
                            .sizeBytes(s3Object.size())
                            .lastModified(s3Object.lastModified())
                            .etag(s3Object.eTag())
                            .storageProvider(StorageProviderType.R2)
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to list R2 objects for prefix={}: {}", prefix, e.getMessage());
            return Collections.emptyList();
        }
    }

    private String getBucketName() {
        String bucket = cloudflareProperties.getR2().getBucketName();
        return (bucket != null && !bucket.isBlank()) ? bucket : "collegebook-r2-bucket";
    }
}
