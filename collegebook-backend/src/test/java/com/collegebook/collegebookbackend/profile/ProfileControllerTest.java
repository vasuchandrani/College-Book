package com.collegebook.collegebookbackend.profile;

import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.profile.controller.ProfileController;
import com.collegebook.collegebookbackend.profile.dto.PublicProfileDto;
import com.collegebook.collegebookbackend.profile.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetStudentBySlug() throws Exception {
        PublicProfileDto dto = new PublicProfileDto();
        dto.setFullName("Vatsal Chandrani");
        dto.setSlug("vatsal");
        dto.setCourseName("B.Tech IT");
        dto.setDefaultBio("B.Tech IT • 4th Year");

        when(profileService.getStudentBySlug("vatsal")).thenReturn(dto);

        mockMvc.perform(get("/api/v1/students/vatsal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Vatsal Chandrani"))
                .andExpect(jsonPath("$.defaultBio").value("B.Tech IT • 4th Year"));
    }
}
