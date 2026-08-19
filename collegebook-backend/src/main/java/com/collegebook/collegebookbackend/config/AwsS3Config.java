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

/**
 * Configures the native AWS S3 client and presigner beans.
 */
@Configuration
@RequiredArgsConstructor
public class AwsS3Config {

    private final AwsS3Properties awsS3Properties;

    @Bean(name = "awsS3Client")
    public S3Client awsS3Client() {
        Region region = resolveRegion(awsS3Properties.getRegion());
        AwsCredentialsProvider credentialsProvider = resolveCredentials(
                awsS3Properties.getAccessKeyId(),
                awsS3Properties.getSecretAccessKey()
        );

        return S3Client.builder()
                .region(region)
                .credentialsProvider(credentialsProvider)
                .build();
    }

    @Bean(name = "awsS3Presigner")
    public S3Presigner awsS3Presigner() {
        Region region = resolveRegion(awsS3Properties.getRegion());
        AwsCredentialsProvider credentialsProvider = resolveCredentials(
                awsS3Properties.getAccessKeyId(),
                awsS3Properties.getSecretAccessKey()
        );

        return S3Presigner.builder()
                .region(region)
                .credentialsProvider(credentialsProvider)
                .build();
    }

    private Region resolveRegion(String regionStr) {
        if (regionStr != null && !regionStr.isBlank()) {
            return Region.of(regionStr);
        }
        return Region.AP_SOUTH_1;
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
