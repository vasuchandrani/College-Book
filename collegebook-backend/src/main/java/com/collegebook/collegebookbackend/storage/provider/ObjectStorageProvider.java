package com.collegebook.collegebookbackend.storage.provider;

import com.collegebook.collegebookbackend.storage.model.ObjectMetadata;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.model.StoredObjectSummary;

import java.time.Duration;
import java.util.List;

/**
 * Strategy interface defining common object storage operations.
 * Implemented by S3StorageProvider and R2StorageProvider.
 */
public interface ObjectStorageProvider {

    /**
     * Return the provider type this implementation represents.
     */
    StorageProviderType getProviderType();

    /**
     * Generate a presigned PUT upload URL for an object key.
     */
    PresignedUploadResult generatePresignedUploadUrl(String objectKey, String contentType, long fileSizeBytes);

    /**
     * Generate a presigned GET access URL with the specified expiry.
     */
    String generateAccessUrl(String objectKey, Duration expiry);

    /**
     * Get the public CDN / direct URL for an object key if configured.
     */
    String getPublicUrl(String objectKey);

    /**
     * Delete an object by its storage key.
     */
    void deleteObject(String objectKey);

    /**
     * Delete multiple objects by their storage keys in batch.
     */
    void deleteObjects(List<String> objectKeys);

    /**
     * Check whether an object exists in the storage bucket.
     */
    boolean objectExists(String objectKey);

    /**
     * Fetch metadata for a stored object.
     */
    ObjectMetadata getObjectMetadata(String objectKey);

    /**
     * Copy an object within the bucket or provider.
     */
    void copyObject(String sourceKey, String destinationKey);

    /**
     * List objects starting with the given prefix up to maxKeys.
     */
    List<StoredObjectSummary> listObjects(String prefix, int maxKeys);
}
