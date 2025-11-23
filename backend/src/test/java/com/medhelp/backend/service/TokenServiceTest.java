package com.medhelp.backend.service;

import com.medhelp.backend.config.JwtConfigProperties;
import com.medhelp.backend.model.RefreshToken;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.RefreshTokenRepository;
import com.medhelp.backend.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TokenService Tests")
class TokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtConfigProperties jwtConfig;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private TokenService tokenService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
    }

    @Test
    @DisplayName("Should create refresh token successfully")
    void testCreateRefreshToken() {
        // Arrange
        when(jwtConfig.getRefreshTokenExpiration()).thenReturn(86400000L);
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        String token = tokenService.createRefreshToken(
                testUser,
                "device-fingerprint",
                "127.0.0.1",
                "Mozilla/5.0");

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should validate and rotate refresh token")
    void testValidateAndRotate() {
        // Arrange
        when(jwtConfig.getRefreshTokenExpiration()).thenReturn(86400000L);
        RefreshToken oldToken = RefreshToken.builder()
                .id(1L)
                .tokenHash("hashed-token")
                .user(testUser)
                .deviceFingerprint("device-fp")
                .ipAddress("127.0.0.1")
                .userAgent("Mozilla/5.0")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString()))
                .thenReturn(Optional.of(oldToken));
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Optional<RefreshToken> result = tokenService.validateAndRotate("raw-token");

        // Assert
        assertTrue(result.isPresent());
        assertTrue(oldToken.getIsRevoked());
        assertNotNull(oldToken.getRevokedAt());
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should return empty when token not found")
    void testValidateAndRotateTokenNotFound() {
        // Arrange
        when(refreshTokenRepository.findByTokenHash(anyString()))
                .thenReturn(Optional.empty());

        // Act
        Optional<RefreshToken> result = tokenService.validateAndRotate("invalid-token");

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should revoke token successfully")
    void testRevokeToken() {
        // Arrange
        RefreshToken token = RefreshToken.builder()
                .id(1L)
                .tokenHash("hashed-token")
                .user(testUser)
                .isRevoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString()))
                .thenReturn(Optional.of(token));

        // Act
        tokenService.revokeToken("raw-token");

        // Assert
        verify(refreshTokenRepository).save(token);
        assertTrue(token.getIsRevoked());
    }

    @Test
    @DisplayName("Should revoke all tokens for user")
    void testRevokeAllTokensForUser() {
        // Act
        tokenService.revokeAllTokensForUser(testUser);

        // Assert
        verify(refreshTokenRepository).revokeAllByUser(eq(testUser), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should set refresh token cookie")
    void testSetRefreshTokenCookie() {
        // Arrange
        when(jwtConfig.getRefreshTokenExpiration()).thenReturn(86400000L);

        // Act
        tokenService.setRefreshTokenCookie(response, "test-token");

        // Assert
        verify(response).addCookie(any(Cookie.class));
    }

    @Test
    @DisplayName("Should get refresh token from cookie")
    void testGetRefreshTokenFromCookie() {
        // Arrange
        Cookie cookie = new Cookie("refresh_token", "test-token");
        when(request.getCookies()).thenReturn(new Cookie[] { cookie });

        // Act
        Optional<String> result = tokenService.getRefreshTokenFromCookie(request);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("test-token", result.get());
    }

    @Test
    @DisplayName("Should return empty when no cookies present")
    void testGetRefreshTokenFromCookieNoCookies() {
        // Arrange
        when(request.getCookies()).thenReturn(null);

        // Act
        Optional<String> result = tokenService.getRefreshTokenFromCookie(request);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should clear refresh token cookie")
    void testClearRefreshTokenCookie() {
        // Act
        tokenService.clearRefreshTokenCookie(response);

        // Assert
        verify(response).addCookie(any(Cookie.class));
    }
}
