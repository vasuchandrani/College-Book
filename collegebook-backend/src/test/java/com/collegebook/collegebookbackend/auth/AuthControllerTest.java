package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.controller.AuthController;
import com.collegebook.collegebookbackend.auth.dto.AuthResponseDto;
import com.collegebook.collegebookbackend.auth.dto.ForgotPasswordRequest;
import com.collegebook.collegebookbackend.auth.dto.LoginRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpRequest;
import com.collegebook.collegebookbackend.auth.dto.SendOtpResponse;
import com.collegebook.collegebookbackend.auth.dto.UserDto;
import com.collegebook.collegebookbackend.auth.service.AuthService;
import com.collegebook.collegebookbackend.config.JwtAuthFilter;
import com.collegebook.collegebookbackend.config.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private JwtService jwtService;

    @Test
    void testSendOtp() throws Exception {
        SendOtpRequest req = new SendOtpRequest("student@ddu.ac.in", "SIGNUP");
        SendOtpResponse resp = SendOtpResponse.builder().sent(true).userExists(false).message("OTP sent").build();

        when(authService.sendOtp(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/auth/otp/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sent").value(true))
                .andExpect(jsonPath("$.message").value("OTP sent"));
    }

    @Test
    void testLoginSuccess() throws Exception {
        LoginRequest req = new LoginRequest("student@ddu.ac.in", "password123");
        UserDto u = UserDto.builder().id(UUID.randomUUID()).email("student@ddu.ac.in").build();
        AuthResponseDto resp = new AuthResponseDto("access-token-123", "refresh-token-123", u);

        when(authService.login(any(), any(), any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token-123"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token-123"));
    }

    @Test
    void testForgotPasswordWithJsonBody() throws Exception {
        ForgotPasswordRequest req = new ForgotPasswordRequest("student@ddu.ac.in");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset email sent if account exists"));

        verify(authService).forgotPassword("student@ddu.ac.in");
    }

    @Test
    void testForgotPasswordWithQueryParam() throws Exception {
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .param("email", "student@ddu.ac.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset email sent if account exists"));

        verify(authService).forgotPassword("student@ddu.ac.in");
    }

    @Test
    void testCheckHandleEndpoint() throws Exception {
        com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse res =
                com.collegebook.collegebookbackend.auth.dto.HandleAvailabilityResponse.builder()
                        .handle("vatsal_dev")
                        .available(true)
                        .message("Handle @vatsal_dev is available")
                        .build();

        when(authService.checkHandle("vatsal_dev")).thenReturn(res);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/auth/check-handle")
                        .param("handle", "vatsal_dev"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handle").value("vatsal_dev"))
                .andExpect(jsonPath("$.available").value(true));
    }
}
