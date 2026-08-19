package com.collegebook.collegebookbackend.storage.model;

/**
 * Identifies which object storage backend holds the media file.
 */
public enum StorageProviderType {
    S3,
    R2,
    CLOUDINARY
}
