package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.config.StorageProperties;
import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import com.collegebook.collegebookbackend.storage.provider.ObjectStorageProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Strategy Registry holding all available ObjectStorageProvider instances.
 * Routes operations to the active provider or a specific historical provider.
 */
@Slf4j
@Component
public class StorageProviderRegistry {

    private final Map<StorageProviderType, ObjectStorageProvider> providers = new EnumMap<>(StorageProviderType.class);
    private final StorageProperties storageProperties;

    public StorageProviderRegistry(List<ObjectStorageProvider> providerList, StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
        for (ObjectStorageProvider provider : providerList) {
            providers.put(provider.getProviderType(), provider);
            log.info("Registered storage provider: {}", provider.getProviderType());
        }
    }

    /**
     * Get the active storage provider configured in storage.active-provider.
     */
    public ObjectStorageProvider getActiveProvider() {
        StorageProviderType activeType = storageProperties.getActiveProvider();
        if (activeType == null) {
            activeType = StorageProviderType.S3;
        }
        ObjectStorageProvider provider = providers.get(activeType);
        if (provider == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "No storage provider configured for active type: " + activeType);
        }
        return provider;
    }

    /**
     * Get the active storage provider type (e.g. S3 or R2).
     */
    public StorageProviderType getActiveProviderType() {
        return storageProperties.getActiveProvider() != null ? storageProperties.getActiveProvider() : StorageProviderType.S3;
    }

    /**
     * Get a specific storage provider by type (used for fetching/deleting historical media).
     */
    public ObjectStorageProvider getProvider(StorageProviderType type) {
        if (type == null) {
            return getActiveProvider();
        }
        ObjectStorageProvider provider = providers.get(type);
        if (provider == null) {
            log.warn("Storage provider {} not found in registry, falling back to active provider", type);
            return getActiveProvider();
        }
        return provider;
    }

    /**
     * Check if a specific provider is available in the registry.
     */
    public boolean hasProvider(StorageProviderType type) {
        return providers.containsKey(type);
    }
}
