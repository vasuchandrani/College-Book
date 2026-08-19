package com.collegebook.collegebookbackend.storage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Metadata representation of a stored object in S3 or R2.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObjectMetadata {
    private String objectKey;
    private String contentType;
    private Long contentLength;
    private String etag;
    private Instant lastModified;
    private StorageProviderType storageProvider;
    private Map<String, String> userMetadata;
}
