package com.collegebook.collegebookbackend.storage.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Result of generating a presigned upload URL from an ObjectStorageProvider.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUploadResult {
    private String uploadUrl;
    private String objectKey;
    private String publicUrl;
    private StorageProviderType provider;
}
