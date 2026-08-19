package com.collegebook.collegebookbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Binds AWS S3 configuration from application.yml.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "aws.s3")
public class AwsS3Properties {
    private String region = "ap-south-1";
    private String accessKeyId;
    private String secretAccessKey;
    private String bucketName;
    private String publicUrl;
}
