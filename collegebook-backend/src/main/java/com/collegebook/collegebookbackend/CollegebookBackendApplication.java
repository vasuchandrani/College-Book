package com.collegebook.collegebookbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class CollegebookBackendApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(CollegebookBackendApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] candidatePaths = {
                Path.of(".env"),
                Path.of("collegebook-backend/.env"),
                Path.of("../collegebook-backend/.env")
        };

        for (Path path : candidatePaths) {
            if (Files.exists(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int idx = line.indexOf('=');
                        String key = line.substring(0, idx).trim();
                        String value = line.substring(idx + 1).trim();
                        // Remove enclosing quotes if present
                        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
