package com.collegebook.collegebookbackend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Binds all Cloudflare-related configuration from application.yml.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "cloudflare")
public class CloudflareProperties {

    private R2 r2 = new R2();
    private Stream stream = new Stream();

    @Data
    public static class R2 {
        private String accountId;
        private String accessKeyId;
        private String secretAccessKey;
        private String bucketName;
        private String endpoint;
        private String publicUrl;
    }

    @Data
    public static class Stream {
        private String accountId;
        private String apiToken;
    }
}
