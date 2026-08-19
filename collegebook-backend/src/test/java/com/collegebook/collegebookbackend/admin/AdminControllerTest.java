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
    void testDeleteAd() throws Exception {
        UUID adId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/admin/ads/" + adId))
                .andExpect(status().isNoContent());

        verify(adminService).deleteAd(adId);
    }
}
