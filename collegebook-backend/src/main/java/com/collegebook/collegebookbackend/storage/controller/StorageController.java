package com.collegebook.collegebookbackend.storage.controller;

import com.collegebook.collegebookbackend.auth.UserPrincipal;
import com.collegebook.collegebookbackend.common.CurrentUser;
import com.collegebook.collegebookbackend.storage.dto.PresignedUploadRequest;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.dto.VideoUploadResponse;
import com.collegebook.collegebookbackend.storage.service.StorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints for media upload authorization.
 * The backend does NOT receive the actual files — it generates presigned URLs
 * so the frontend uploads directly to R2 or Cloudflare Stream.
 */
@RestController
@RequestMapping("/api/v1/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    /**
     * Direct multipart upload endpoint (e.g. to Cloudinary).
     */
    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponseDto> uploadFile(
            @CurrentUser UserPrincipal currentUser,
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @org.springframework.web.bind.annotation.RequestParam(value = "mediaContext", defaultValue = "POST") String mediaContext) {
        UploadResponseDto response = storageService.uploadDirect(
                file,
                mediaContext,
                currentUser != null ? currentUser.getId().toString() : null
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a presigned R2/S3 URL for uploading an image or document.
     * The frontend then PUTs the file directly using this URL.
     */
    @PostMapping("/presign-upload")
    public ResponseEntity<UploadResponseDto> presignUpload(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody PresignedUploadRequest request) {

        if ("AVATAR".equalsIgnoreCase(request.getMediaContext())) {
            UploadResponseDto response = storageService.generateAvatarUploadUrl(
                    request.getFileName(),
                    request.getContentType(),
                    request.getFileSizeBytes(),
                    currentUser.getId().toString()
            );
            return ResponseEntity.ok(response);
        }

        UploadResponseDto response = storageService.generateImageUploadUrl(
                request.getFileName(),
                request.getContentType(),
                request.getFileSizeBytes(),
                request.getMediaContext()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Generate a Cloudflare Stream direct-upload URL for videos.
     * The frontend then uploads the video directly to Stream via TUS protocol.
     */
    @PostMapping("/video-upload")
    public ResponseEntity<VideoUploadResponse> videoUpload(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody PresignedUploadRequest request) {

        VideoUploadResponse response = storageService.generateVideoUploadUrl(
                request.getFileName(),
                request.getContentType(),
                request.getFileSizeBytes()
        );
        return ResponseEntity.ok(response);
    }
}
