package com.collegebook.collegebookbackend.college;

import com.collegebook.collegebookbackend.college.controller.CollegeController;
import com.collegebook.collegebookbackend.college.dto.CollegeDto;
import com.collegebook.collegebookbackend.college.service.CollegeService;
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

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CollegeController.class)
@AutoConfigureMockMvc(addFilters = false)
public class CollegeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CollegeService collegeService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetAllColleges() throws Exception {
        CollegeDto c = new CollegeDto();
        c.setId(UUID.randomUUID());
        c.setName("IIT Delhi");
        c.setShortName("IIT-D");
        c.setSlug("iit-delhi");
        c.setEmailDomains(List.of("iitd.ac.in"));

        when(collegeService.getAllColleges()).thenReturn(List.of(c));

        mockMvc.perform(get("/api/v1/colleges"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("IIT Delhi"))
                .andExpect(jsonPath("$[0].shortName").value("IIT-D"));
    }

    @Test
    void testRequestCollege() throws Exception {
        com.collegebook.collegebookbackend.college.dto.CollegeRequestDto responseDto =
                com.collegebook.collegebookbackend.college.dto.CollegeRequestDto.builder()
                        .id(UUID.randomUUID())
                        .collegeName("Government Engineering College Dahod")
                        .requesterEmail("student@gecdahod.ac.in")
                        .status("PENDING")
                        .build();

        when(collegeService.requestCollege(org.mockito.ArgumentMatchers.any(com.collegebook.collegebookbackend.college.dto.CollegeRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/colleges/request")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content("{\"collegeName\":\"Government Engineering College Dahod\",\"requesterEmail\":\"student@gecdahod.ac.in\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collegeName").value("Government Engineering College Dahod"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
