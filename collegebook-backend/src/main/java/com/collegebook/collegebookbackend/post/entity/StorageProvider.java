package com.collegebook.collegebookbackend.post.entity;

/**
 * Identifies which cloud storage backend holds the media file.
 */
public enum StorageProvider {
    S3,
    R2,
    CLOUDFLARE_STREAM,
    CLOUDINARY
}
