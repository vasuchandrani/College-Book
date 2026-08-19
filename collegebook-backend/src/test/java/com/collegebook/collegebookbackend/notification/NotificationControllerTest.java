package com.collegebook.collegebookbackend.notification;

import com.collegebook.collegebookbackend.common.PageResponse;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import com.collegebook.collegebookbackend.notification.controller.NotificationController;
import com.collegebook.collegebookbackend.notification.dto.NotificationDto;
import com.collegebook.collegebookbackend.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testGetMyNotifications() throws Exception {
        NotificationDto n = new NotificationDto();
        n.setId(UUID.randomUUID());
        n.setTitle("New Join Request");
        n.setRead(false);

        PageResponse<NotificationDto> page = PageResponse.<NotificationDto>builder()
                .items(List.of(n))
                .page(0)
                .size(20)
                .totalItems(1)
                .totalPages(1)
                .hasNext(false)
                .build();

        when(notificationService.getMyNotifications(any(), anyInt(), anyInt())).thenReturn(page);

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].title").value("New Join Request"));
    }
}
