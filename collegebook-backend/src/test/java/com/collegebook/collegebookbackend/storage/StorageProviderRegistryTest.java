package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.config.StorageProperties;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.ObjectStorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StorageProviderRegistryTest {

    @Mock
    private ObjectStorageProvider s3Provider;

    @Mock
    private ObjectStorageProvider r2Provider;

    private StorageProperties storageProperties;
    private StorageProviderRegistry registry;

    @BeforeEach
    void setUp() {
        when(s3Provider.getProviderType()).thenReturn(StorageProviderType.S3);
        when(r2Provider.getProviderType()).thenReturn(StorageProviderType.R2);

        storageProperties = new StorageProperties();
        storageProperties.setActiveProvider(StorageProviderType.S3);

        registry = new StorageProviderRegistry(List.of(s3Provider, r2Provider), storageProperties);
    }

    @Test
    void testGetActiveProviderDefaultsToS3() {
        ObjectStorageProvider active = registry.getActiveProvider();
        assertEquals(StorageProviderType.S3, active.getProviderType());
        assertEquals(StorageProviderType.S3, registry.getActiveProviderType());
    }

    @Test
    void testGetActiveProviderSwitchesToR2() {
        storageProperties.setActiveProvider(StorageProviderType.R2);
        ObjectStorageProvider active = registry.getActiveProvider();
        assertEquals(StorageProviderType.R2, active.getProviderType());
        assertEquals(StorageProviderType.R2, registry.getActiveProviderType());
    }

    @Test
    void testGetSpecificProvider() {
        ObjectStorageProvider retrievedS3 = registry.getProvider(StorageProviderType.S3);
        assertEquals(StorageProviderType.S3, retrievedS3.getProviderType());

        ObjectStorageProvider retrievedR2 = registry.getProvider(StorageProviderType.R2);
        assertEquals(StorageProviderType.R2, retrievedR2.getProviderType());
    }

    @Test
    void testHasProvider() {
        assertTrue(registry.hasProvider(StorageProviderType.S3));
        assertTrue(registry.hasProvider(StorageProviderType.R2));
    }
}
