package com.collegebook.collegebookbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AnonymousCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configures the AWS S3 client and presigner to point at the Cloudflare R2 endpoint.
 * R2 is fully S3-compatible, so we use the standard AWS SDK.
 * Supports anonymous credentials as fallback when env vars are empty.
 */
@Configuration
@RequiredArgsConstructor
public class CloudflareR2Config {

    private final CloudflareProperties cloudflareProperties;

    @Bean(name = "r2S3Client")
    public S3Client r2S3Client() {
        CloudflareProperties.R2 r2 = cloudflareProperties.getR2();
        URI endpoint = resolveEndpoint(r2.getEndpoint());
        AwsCredentialsProvider credentialsProvider = resolveCredentials(r2.getAccessKeyId(), r2.getSecretAccessKey());

        return S3Client.builder()
                .endpointOverride(endpoint)
                .credentialsProvider(credentialsProvider)
                .region(Region.of("auto"))
                .forcePathStyle(true)
                .build();
    }

    @Bean(name = "r2S3Presigner")
    public S3Presigner r2S3Presigner() {
        CloudflareProperties.R2 r2 = cloudflareProperties.getR2();
        URI endpoint = resolveEndpoint(r2.getEndpoint());
        AwsCredentialsProvider credentialsProvider = resolveCredentials(r2.getAccessKeyId(), r2.getSecretAccessKey());

        return S3Presigner.builder()
                .endpointOverride(endpoint)
                .credentialsProvider(credentialsProvider)
                .region(Region.of("auto"))
                .build();
    }

    private URI resolveEndpoint(String endpoint) {
        if (endpoint != null && !endpoint.isBlank()) {
            return URI.create(endpoint);
        }
        return URI.create("https://auto.r2.cloudflarestorage.com");
    }

    private static final String DEFAULT_DEV_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    private static final String DEFAULT_DEV_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

    private AwsCredentialsProvider resolveCredentials(String accessKeyId, String secretAccessKey) {
        if (accessKeyId != null && !accessKeyId.isBlank() && secretAccessKey != null && !secretAccessKey.isBlank()) {
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey));
        }
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(DEFAULT_DEV_ACCESS_KEY, DEFAULT_DEV_SECRET_KEY));
    }
}
