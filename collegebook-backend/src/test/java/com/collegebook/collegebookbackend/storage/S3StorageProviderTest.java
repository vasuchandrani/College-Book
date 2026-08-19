package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.config.AwsS3Properties;
import com.collegebook.collegebookbackend.storage.model.PresignedUploadResult;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.S3StorageProvider;
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
public class S3StorageProviderTest {

    @Mock
    private S3Client s3Client;
    @Mock
    private S3Presigner s3Presigner;

    private AwsS3Properties awsS3Properties;
    private S3StorageProvider s3StorageProvider;

    @BeforeEach
    void setUp() {
        awsS3Properties = new AwsS3Properties();
        awsS3Properties.setBucketName("test-s3-bucket");
        awsS3Properties.setRegion("ap-south-1");
        awsS3Properties.setPublicUrl("https://cdn.collegebook.com");

        s3StorageProvider = new S3StorageProvider(s3Client, s3Presigner, awsS3Properties);
    }

    @Test
    void testGetProviderType() {
        assertEquals(StorageProviderType.S3, s3StorageProvider.getProviderType());
    }

    @Test
    void testGeneratePresignedUploadUrl() {
        PresignedPutObjectRequest presignedPut = mock(PresignedPutObjectRequest.class);
        try {
            when(presignedPut.url()).thenReturn(URI.create("https://test-s3-bucket.s3.amazonaws.com/posts/image.jpg?auth=123").toURL());
        } catch (Exception ignored) {}

        when(s3Presigner.presignPutObject(any(PutObjectPresignRequest.class))).thenReturn(presignedPut);

        PresignedUploadResult result = s3StorageProvider.generatePresignedUploadUrl(
                "posts/image.jpg", "image/jpeg", 1024
        );

        assertNotNull(result);
        assertEquals(StorageProviderType.S3, result.getProvider());
        assertEquals("posts/image.jpg", result.getObjectKey());
        assertEquals("https://cdn.collegebook.com/posts/image.jpg", result.getPublicUrl());
    }

    @Test
    void testDeleteObject() {
        s3StorageProvider.deleteObject("posts/old.jpg");
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void testObjectExistsTrue() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenReturn(HeadObjectResponse.builder().build());
        assertTrue(s3StorageProvider.objectExists("posts/exists.jpg"));
    }

    @Test
    void testObjectExistsFalse() {
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenThrow(NoSuchKeyException.builder().build());
        assertFalse(s3StorageProvider.objectExists("posts/missing.jpg"));
    }
}
