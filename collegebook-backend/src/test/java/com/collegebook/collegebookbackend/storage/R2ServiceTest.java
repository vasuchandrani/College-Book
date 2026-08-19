package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.service.R2Service;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URL;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class R2ServiceTest {

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private S3Client s3Client;

    private CloudflareProperties cloudflareProperties;
    private R2Service r2Service;

    @BeforeEach
    void setUp() {
        cloudflareProperties = new CloudflareProperties();
        cloudflareProperties.getR2().setBucketName("test-bucket");
        cloudflareProperties.getR2().setEndpoint("https://test.r2.cloudflarestorage.com");
        cloudflareProperties.getR2().setPublicUrl("https://pub-test.r2.dev");

        r2Service = new R2Service(s3Presigner, s3Client, cloudflareProperties);
    }

    @Test
    void testGeneratePresignedUploadUrl_Success() throws Exception {
        PresignedPutObjectRequest presignedMock = mock(PresignedPutObjectRequest.class);
        when(presignedMock.url()).thenReturn(new URL("https://test.r2.cloudflarestorage.com/test-bucket/posts/images/test.jpg?signature=xyz"));
        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedMock);

        UploadResponseDto response = r2Service.generatePresignedUploadUrl("test.jpg", "image/jpeg", 1024 * 100, "posts/images");

        assertNotNull(response);
        assertNotNull(response.getUploadUrl());
        assertTrue(response.getObjectKey().startsWith("posts/images/"));
        assertTrue(response.getPublicUrl().startsWith("https://pub-test.r2.dev/posts/images/"));
    }

    @Test
    void testGeneratePresignedUploadUrl_InvalidFileType() {
        AppException ex = assertThrows(AppException.class, () ->
                r2Service.generatePresignedUploadUrl("test.exe", "application/x-msdownload", 1024, "posts/images")
        );
        assertEquals(ErrorCode.INVALID_FILE_TYPE, ex.getErrorCode());
    }

    @Test
    void testGeneratePresignedUploadUrl_FileTooLarge() {
        AppException ex = assertThrows(AppException.class, () ->
                r2Service.generatePresignedUploadUrl("huge.png", "image/png", 15 * 1024 * 1024, "posts/images")
        );
        assertEquals(ErrorCode.FILE_TOO_LARGE, ex.getErrorCode());
    }

    @Test
    void testDeleteObject() {
        r2Service.deleteObject("posts/images/sample.jpg");
        verify(s3Client).deleteObject(any(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.class));
    }
}
