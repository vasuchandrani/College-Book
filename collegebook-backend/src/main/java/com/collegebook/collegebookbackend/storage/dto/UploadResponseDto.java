package com.collegebook.collegebookbackend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response returned when a presigned R2 upload URL is generated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponseDto {

    private String uploadUrl;
    private String objectKey;
    private String publicUrl;
    private String storageProvider;
}
