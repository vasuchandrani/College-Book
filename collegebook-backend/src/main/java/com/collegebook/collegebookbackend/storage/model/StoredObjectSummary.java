package com.collegebook.collegebookbackend.storage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Summary of a stored object returned during bucket listing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredObjectSummary {
    private String objectKey;
    private Long sizeBytes;
    private Instant lastModified;
    private String etag;
    private StorageProviderType storageProvider;
}
