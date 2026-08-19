package com.collegebook.collegebookbackend.config;

import com.collegebook.collegebookbackend.storage.model.StorageProviderType;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Top-level storage configuration properties.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    /**
     * Active storage provider for new uploads: S3 or R2.
     */
    private StorageProviderType activeProvider = StorageProviderType.S3;
}
