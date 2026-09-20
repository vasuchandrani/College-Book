package com.collegebook.collegebookbackend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sesv2.SesV2Client;

/**
 * Configures the AWS SES v2 client bean.
 */
@Configuration
@RequiredArgsConstructor
public class AwsSesConfig {

    private final AwsSesProperties awsSesProperties;

    private static final String DEFAULT_DEV_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
    private static final String DEFAULT_DEV_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

    @Bean(name = "sesV2Client")
    public SesV2Client sesV2Client() {
        Region region = resolveRegion(awsSesProperties.getRegion());
        AwsCredentialsProvider credentialsProvider = resolveCredentials(
                awsSesProperties.getAccessKeyId(),
                awsSesProperties.getSecretAccessKey()
        );

        return SesV2Client.builder()
                .region(region)
                .credentialsProvider(credentialsProvider)
                .build();
    }

    private Region resolveRegion(String regionStr) {
        if (regionStr != null && !regionStr.isBlank()) {
            return Region.of(regionStr);
        }
        return Region.EU_NORTH_1;
    }

    private AwsCredentialsProvider resolveCredentials(String accessKeyId, String secretAccessKey) {
        if (accessKeyId != null && !accessKeyId.isBlank() && secretAccessKey != null && !secretAccessKey.isBlank()) {
            return StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey));
        }
        return StaticCredentialsProvider.create(AwsBasicCredentials.create(DEFAULT_DEV_ACCESS_KEY, DEFAULT_DEV_SECRET_KEY));
    }
}
