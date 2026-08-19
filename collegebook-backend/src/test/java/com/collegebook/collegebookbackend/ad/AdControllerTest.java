package com.collegebook.collegebookbackend.ad;

import com.collegebook.collegebookbackend.ad.controller.AdController;
import com.collegebook.collegebookbackend.ad.dto.AdResponseDto;
import com.collegebook.collegebookbackend.ad.service.AdService;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AdControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdService adService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetFeedAds() throws Exception {
        AdResponseDto ad = new AdResponseDto();
        ad.setId(UUID.randomUUID());
        ad.setTitle("Campus Placement Prep");

        when(adService.getFeedAds(any(), any())).thenReturn(List.of(ad));

        mockMvc.perform(get("/api/v1/ads/feed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Campus Placement Prep"));
    }

    @Test
    void testGetExploreAds() throws Exception {
        AdResponseDto ad = new AdResponseDto();
        ad.setId(UUID.randomUUID());
        ad.setTitle("Student Hackathon 2026");

        when(adService.getExploreAds(any())).thenReturn(List.of(ad));

        mockMvc.perform(get("/api/v1/ads/explore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Student Hackathon 2026"));
    }
}
