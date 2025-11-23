package com.medhelp.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medhelp.backend.dto.*;
import com.medhelp.backend.model.Role;
import com.medhelp.backend.model.User;
import com.medhelp.backend.model.UserType;
import com.medhelp.backend.service.AuthenticationService;
import com.medhelp.backend.service.EmailVerificationService;
import com.medhelp.backend.service.PasswordResetService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for simplicity in unit tests
public class AuthenticationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationService authenticationService;

    @MockBean
    private EmailVerificationService emailVerificationService;

    @MockBean
    private PasswordResetService passwordResetService;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;
    private LoginResponse loginResponse;

    @BeforeEach
    void setUp() {
        Role role = new Role();
        role.setName("ROLE_PATIENT");

        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .username("testuser")
                .password("password")
                .userType(UserType.EXTERNAL)
                .roles(Set.of(role))
                .emailVerified(true)
                .build();

        loginResponse = LoginResponse.builder()
                .accessToken("access-token")
                .build();
    }

    @Test
    void register_ShouldReturnLoginResponse() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123!");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setRole("PATIENT");

        given(authenticationService.register(any(RegisterRequest.class), any(), any()))
                .willReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void login_ShouldReturnLoginResponse() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123!");

        given(authenticationService.login(any(LoginRequest.class), any(), any()))
                .willReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void verify2FA_ShouldReturnLoginResponse() throws Exception {
        Verify2FARequest request = new Verify2FARequest();
        request.setSessionId("session-id");
        request.setCode("123456");

        given(authenticationService.verify2FA(anyString(), anyString(), any()))
                .willReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/verify-2fa")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void refresh_ShouldReturnLoginResponse() throws Exception {
        given(authenticationService.refresh(any(), any()))
                .willReturn(loginResponse);

        mockMvc.perform(post("/api/v1/auth/refresh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    @Test
    void logout_ShouldReturnSuccessMessage() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        verify(authenticationService).logout(any(), any());
    }

    @Test
    void verifyEmail_ShouldReturnSuccessMessage_WhenTokenIsValid() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setToken("valid-token");

        given(emailVerificationService.verifyEmail("valid-token")).willReturn(true);

        mockMvc.perform(post("/api/v1/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully"));
    }

    @Test
    void verifyEmail_ShouldReturnBadRequest_WhenTokenIsInvalid() throws Exception {
        VerifyEmailRequest request = new VerifyEmailRequest();
        request.setToken("invalid-token");

        given(emailVerificationService.verifyEmail("invalid-token")).willReturn(false);

        mockMvc.perform(post("/api/v1/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired token"));
    }

    @Test
    void forgotPassword_ShouldReturnSuccessMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If the email exists, a password reset link has been sent"));

        verify(passwordResetService).initiatePasswordReset("test@example.com");
    }

    @Test
    void resetPassword_ShouldReturnSuccessMessage_WhenResetSuccessful() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("NewPassword123!");

        given(passwordResetService.resetPassword("valid-token", "NewPassword123!")).willReturn(true);

        mockMvc.perform(post("/api/v1/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));
    }
}
