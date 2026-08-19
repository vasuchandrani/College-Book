package com.collegebook.collegebookbackend.collab;

import com.collegebook.collegebookbackend.collab.controller.CollabController;
import com.collegebook.collegebookbackend.collab.dto.TeamResponseDto;
import com.collegebook.collegebookbackend.collab.entity.TeamType;
import com.collegebook.collegebookbackend.collab.service.CollabService;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import org.springframework.http.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CollabController.class)
@AutoConfigureMockMvc(addFilters = false)
public class CollabControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CollabService collabService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetTeamById() throws Exception {
        UUID teamId = UUID.randomUUID();
        TeamResponseDto dto = new TeamResponseDto();
        dto.setId(teamId);
        dto.setTitle("AI Campus Assistant");
        dto.setType(TeamType.PROJECT);

        when(collabService.getTeamById(any(), any())).thenReturn(dto);

        mockMvc.perform(get("/api/v1/teams/" + teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("AI Campus Assistant"));
    }

    @Test
    void testDeleteTeam() throws Exception {
        UUID teamId = UUID.randomUUID();
        doNothing().when(collabService).deleteTeam(any(), any());

        mockMvc.perform(delete("/api/v1/teams/" + teamId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Team/project deleted successfully"));
    }

    @Test
    void testAddMember() throws Exception {
        UUID teamId = UUID.randomUUID();
        TeamResponseDto dto = new TeamResponseDto();
        dto.setId(teamId);
        dto.setTitle("AI Team");
        dto.setCurrentMembersCount(2);

        when(collabService.addMember(any(), any(), any())).thenReturn(dto);

        mockMvc.perform(post("/api/v1/teams/" + teamId + "/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"handle\":\"alice_dev\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentMembersCount").value(2));
    }

    @Test
    void testRemoveMember() throws Exception {
        UUID teamId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        TeamResponseDto dto = new TeamResponseDto();
        dto.setId(teamId);
        dto.setCurrentMembersCount(1);

        when(collabService.removeMember(any(), any(), any())).thenReturn(dto);

        mockMvc.perform(delete("/api/v1/teams/" + teamId + "/members/" + memberId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentMembersCount").value(1));
    }

    @Test
    void testDeleteJoinRequest() throws Exception {
        UUID requestId = UUID.randomUUID();
        doNothing().when(collabService).deleteJoinRequest(any(), any());

        mockMvc.perform(delete("/api/v1/join-requests/" + requestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Join request withdrawn successfully"));
    }
}
