package com.collegebook.collegebookbackend.storage.service;

import com.collegebook.collegebookbackend.common.AppException;
import com.collegebook.collegebookbackend.common.ErrorCode;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@Slf4j
@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:wlayvv5n}")
    private String cloudName;

    @Value("${cloudinary.api-key:949766427642127}")
    private String apiKey;

    @Value("${cloudinary.api-secret:LugjCngmmkNPBffdZ4NVeufhLc8}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UploadResponseDto uploadFile(MultipartFile file, String mediaContext) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "File must not be empty");
        }

        try {
            String folder = resolveFolder(mediaContext);
            long timestamp = Instant.now().getEpochSecond();

            // Cloudinary signature: SHA-1 of "folder={folder}&timestamp={timestamp}" + apiSecret
            String toSign = "folder=" + folder + "&timestamp=" + timestamp + apiSecret;
            String signature = sha1Hex(toSign);

            String uploadUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.jpg";
                }
            };
            body.add("file", fileResource);
            body.add("api_key", apiKey);
            body.add("timestamp", String.valueOf(timestamp));
            body.add("folder", folder);
            body.add("signature", signature);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(uploadUrl, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode json = objectMapper.readTree(response.getBody());
                String publicUrl = json.path("secure_url").asText(json.path("url").asText());
                String publicId = json.path("public_id").asText();

                log.info("Cloudinary upload successful: publicId={}, url={}", publicId, publicUrl);

                return UploadResponseDto.builder()
                        .uploadUrl(uploadUrl)
                        .objectKey(publicId)
                        .publicUrl(publicUrl)
                        .storageProvider("CLOUDINARY")
                        .build();
            }

            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Cloudinary upload returned non-200 status");
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload to Cloudinary: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to upload image: " + e.getMessage());
        }
    }

    private String resolveFolder(String mediaContext) {
        if (mediaContext == null) return "collegebook/uploads";
        return switch (mediaContext.toUpperCase()) {
            case "POST", "POST_IMAGE" -> "collegebook/posts";
            case "AVATAR" -> "collegebook/avatars";
            case "DOCUMENT" -> "collegebook/documents";
            default -> "collegebook/uploads";
        };
    }

    private String sha1Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-1 algorithm not found", e);
        }
    }
}
