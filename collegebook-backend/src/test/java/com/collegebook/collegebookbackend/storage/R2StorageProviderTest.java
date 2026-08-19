package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.config.CloudflareProperties;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.R2StorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class R2StorageProviderTest {

    @Mock
    private S3Client s3Client;
    @Mock
    private S3Presigner s3Presigner;

    private CloudflareProperties cloudflareProperties;
    private R2StorageProvider r2StorageProvider;

    @BeforeEach
    void setUp() {
        cloudflareProperties = new CloudflareProperties();
        cloudflareProperties.getR2().setBucketName("test-r2-bucket");
        cloudflareProperties.getR2().setPublicUrl("https://pub-r2.collegebook.dev");

        r2StorageProvider = new R2StorageProvider(s3Client, s3Presigner, cloudflareProperties);
    }

    @Test
    void testGetProviderType() {
        assertEquals(StorageProviderType.R2, r2StorageProvider.getProviderType());
    }

    @Test
    void testGeneratePresignedUploadUrl() {
        PresignedPutObjectRequest presignedPut = mock(PresignedPutObjectRequest.class);
        try {
            when(presignedPut.url()).thenReturn(URI.create("https://test-r2-bucket.r2.cloudflarestorage.com/posts/image.jpg?auth=123").toURL());
        } catch (Exception ignored) {}

        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPut);

        PresignedUploadResult result = r2StorageProvider.generatePresignedUploadUrl(
                "posts/image.jpg", "image/png", 2048
        );

        assertNotNull(result);
        assertEquals(StorageProviderType.R2, result.getProvider());
        assertEquals("posts/image.jpg", result.getObjectKey());
        assertEquals("https://pub-r2.collegebook.dev/posts/image.jpg", result.getPublicUrl());
    }

    @Test
    void testDeleteObject() {
        r2StorageProvider.deleteObject("posts/old-r2.jpg");
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void testObjectExistsTrue() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(HeadObjectResponse.builder().build());
        assertTrue(r2StorageProvider.objectExists("posts/exists.jpg"));
    }

    @Test
    void testObjectExistsFalse() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenThrow(NoSuchKeyException.builder().build());
        assertFalse(r2StorageProvider.objectExists("posts/missing.jpg"));
    }
}
