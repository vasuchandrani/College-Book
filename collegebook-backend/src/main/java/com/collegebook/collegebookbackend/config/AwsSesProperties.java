package com.collegebook.collegebookbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Binds AWS SES configuration from application.yml.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "aws.ses")
public class AwsSesProperties {
    private String region = "eu-north-1";
    private String accessKeyId;
    private String secretAccessKey;
    private String senderEmail = "collegebook.team@gmail.com";
    private String senderName = "CollegeBook";
}
