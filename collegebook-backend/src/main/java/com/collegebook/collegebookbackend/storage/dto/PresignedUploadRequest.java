package com.collegebook.collegebookbackend.storage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for generating a presigned upload URL (images/files via R2 or videos via Stream).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUploadRequest {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "Content type is required")
    private String contentType;

    @Positive(message = "File size must be positive")
    private long fileSizeBytes;

    /**
     * Context for the upload: POST_IMAGE, AVATAR, POST_VIDEO, DOCUMENT.
     */
    private String mediaContext = "POST_IMAGE";
}
