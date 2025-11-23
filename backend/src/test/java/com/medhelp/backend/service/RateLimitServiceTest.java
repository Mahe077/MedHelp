package com.medhelp.backend.service;

import com.medhelp.backend.model.LoginAttempt;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.LoginAttemptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RateLimitService Tests")
class RateLimitServiceTest {

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @InjectMocks
    private RateLimitService rateLimitService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setFailedLoginAttempts(0);

        // Set configuration values using reflection
        ReflectionTestUtils.setField(rateLimitService, "maxLoginAttempts", 10);
        ReflectionTestUtils.setField(rateLimitService, "windowSeconds", 300);
        ReflectionTestUtils.setField(rateLimitService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(rateLimitService, "lockDurationMinutes", 30);
    }

    @Test
    @DisplayName("Should record login attempt successfully")
    void testRecordLoginAttempt() {
        // Arrange
        String email = "test@example.com";
        String ipAddress = "127.0.0.1";
        String userAgent = "Mozilla/5.0";

        when(loginAttemptRepository.save(any(LoginAttempt.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, true, null);

        // Assert
        verify(loginAttemptRepository).save(any(LoginAttempt.class));
    }

    @Test
    @DisplayName("Should not rate limit email when under threshold")
    void testIsEmailRateLimitedUnderThreshold() {
        // Arrange
        when(loginAttemptRepository.countFailedAttemptsByEmail(anyString(), any(LocalDateTime.class)))
                .thenReturn(5L);

        // Act
        boolean result = rateLimitService.isEmailRateLimited("test@example.com");

        // Assert
        assertFalse(result);
    }

    @Test
    @DisplayName("Should rate limit email when threshold exceeded")
    void testIsEmailRateLimitedExceeded() {
        // Arrange
        when(loginAttemptRepository.countFailedAttemptsByEmail(anyString(), any(LocalDateTime.class)))
                .thenReturn(15L);

        // Act
        boolean result = rateLimitService.isEmailRateLimited("test@example.com");

        // Assert
        assertTrue(result);
    }

    @Test
    @DisplayName("Should not rate limit IP when under threshold")
    void testIsIpRateLimitedUnderThreshold() {
        // Arrange
        when(loginAttemptRepository.countFailedAttemptsByIpAddress(anyString(), any(LocalDateTime.class)))
                .thenReturn(5L);

        // Act
        boolean result = rateLimitService.isIpRateLimited("127.0.0.1");

        // Assert
        assertFalse(result);
    }

    @Test
    @DisplayName("Should rate limit IP when threshold exceeded")
    void testIsIpRateLimitedExceeded() {
        // Arrange
        when(loginAttemptRepository.countFailedAttemptsByIpAddress(anyString(), any(LocalDateTime.class)))
                .thenReturn(15L);

        // Act
        boolean result = rateLimitService.isIpRateLimited("127.0.0.1");

        // Assert
        assertTrue(result);
    }

    @Test
    @DisplayName("Should handle failed login and not lock account initially")
    void testHandleFailedLoginNotLocked() {
        // Arrange
        testUser.setFailedLoginAttempts(2);

        // Act
        boolean locked = rateLimitService.handleFailedLogin(testUser);

        // Assert
        assertFalse(locked);
        assertEquals(3, testUser.getFailedLoginAttempts());
    }

    @Test
    @DisplayName("Should lock account after max failed attempts")
    void testHandleFailedLoginLocked() {
        // Arrange
        testUser.setFailedLoginAttempts(4);

        // Act
        boolean locked = rateLimitService.handleFailedLogin(testUser);

        // Assert
        assertTrue(locked);
        assertEquals(5, testUser.getFailedLoginAttempts());
        assertNotNull(testUser.getLockedUntil());
    }

    @Test
    @DisplayName("Should reset failed attempts on successful login")
    void testHandleSuccessfulLogin() {
        // Arrange
        testUser.setFailedLoginAttempts(3);

        // Act
        rateLimitService.handleSuccessfulLogin(testUser);

        // Assert
        assertEquals(0, testUser.getFailedLoginAttempts());
    }
}
