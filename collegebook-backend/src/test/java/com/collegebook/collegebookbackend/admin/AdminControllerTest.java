package com.collegebook.collegebookbackend.admin;

import com.collegebook.collegebookbackend.admin.controller.AdminController;
import com.collegebook.collegebookbackend.admin.service.AdminService;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetAdminStats() throws Exception {
        when(adminService.getAdminStats()).thenReturn(Map.of("students", 100L, "posts", 250L));

        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.students").value(100))
                .andExpect(jsonPath("$.posts").value(250));
    }

    @Test
    void testGetAllAds() throws Exception {
        com.collegebook.collegebookbackend.ad.dto.AdResponseDto adDto = new com.collegebook.collegebookbackend.ad.dto.AdResponseDto();
        adDto.setId(UUID.randomUUID());
        adDto.setTitle("Campus Offer");
        adDto.setDestinationUrl("https://example.com");

        when(adminService.getAllAds()).thenReturn(java.util.List.of(adDto));

        mockMvc.perform(get("/api/v1/admin/ads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Campus Offer"))
                .andExpect(jsonPath("$[0].destinationUrl").value("https://example.com"));
    }

    @Test
    void testToggleAllAds() throws Exception {
        when(adminService.toggleAllAds(false)).thenReturn(Map.of("success", true, "active", false));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/admin/ads/toggle-all")
                        .param("active", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void testGetCampusFeed() throws Exception {
        UUID collegeId = UUID.randomUUID();
        com.collegebook.collegebookbackend.post.dto.PostResponseDto postDto =
                com.collegebook.collegebookbackend.post.dto.PostResponseDto.builder()
                        .id(UUID.randomUUID())
                        .content("Campus announcement")
                        .build();

        com.collegebook.collegebookbackend.common.PageResponse<com.collegebook.collegebookbackend.post.dto.PostResponseDto> pageResp =
                com.collegebook.collegebookbackend.common.PageResponse.of(java.util.List.of(postDto), 0, 20, 1);

        when(adminService.getCampusFeed(org.mockito.ArgumentMatchers.eq(collegeId.toString()), org.mockito.ArgumentMatchers.anyInt(), org.mockito.ArgumentMatchers.anyInt()))
                .thenReturn(pageResp);

        mockMvc.perform(get("/api/v1/admin/posts/feed")
                        .param("collegeId", collegeId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].content").value("Campus announcement"));
    }

    @Test
    void testDeletePost() throws Exception {
        UUID postId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/admin/posts/" + postId))
                .andExpect(status().isNoContent());

        verify(adminService).deletePostByAdmin(postId);
    }
}
