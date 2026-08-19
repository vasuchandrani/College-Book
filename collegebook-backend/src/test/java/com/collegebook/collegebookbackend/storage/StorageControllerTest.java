package com.collegebook.collegebookbackend.storage;

import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.storage.controller.StorageController;
import com.collegebook.collegebookbackend.storage.dto.PresignedUploadRequest;
import com.collegebook.collegebookbackend.storage.dto.UploadResponseDto;
import com.collegebook.collegebookbackend.storage.service.StorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StorageController.class)
@AutoConfigureMockMvc(addFilters = false)
public class StorageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private StorageService storageService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testPresignUpload() throws Exception {
        PresignedUploadRequest req = new PresignedUploadRequest();
        req.setFileName("avatar.png");
        req.setContentType("image/png");
        req.setFileSizeBytes(1024L);
        req.setMediaContext("POST_IMAGE");

        UploadResponseDto resp = UploadResponseDto.builder()
                .uploadUrl("https://r2.cloudflare.com/presigned-url")
                .publicUrl("https://media.collegebook.com/avatar.png")
                .objectKey("posts/avatar.png")
                .storageProvider("R2")
                .build();

        when(storageService.generateImageUploadUrl(anyString(), anyString(), anyLong(), anyString()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/v1/storage/presign-upload")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uploadUrl").value("https://r2.cloudflare.com/presigned-url"))
                .andExpect(jsonPath("$.publicUrl").value("https://media.collegebook.com/avatar.png"));
    }

    @Test
    void testDirectUpload() throws Exception {
        org.springframework.mock.web.MockMultipartFile mockFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "photo.png", "image/png", "image content".getBytes()
        );

        UploadResponseDto resp = UploadResponseDto.builder()
                .uploadUrl("https://api.cloudinary.com/v1_1/wlayvv5n/image/upload")
                .publicUrl("https://res.cloudinary.com/wlayvv5n/image/upload/v123/posts/photo.png")
                .objectKey("collegebook/posts/photo")
                .storageProvider("CLOUDINARY")
                .build();

        when(storageService.uploadDirect(any(), anyString(), any()))
                .thenReturn(resp);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/storage/upload")
                        .file(mockFile)
                        .param("mediaContext", "POST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicUrl").value("https://res.cloudinary.com/wlayvv5n/image/upload/v123/posts/photo.png"))
                .andExpect(jsonPath("$.storageProvider").value("CLOUDINARY"));
    }
}
