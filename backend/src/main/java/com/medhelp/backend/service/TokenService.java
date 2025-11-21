package com.medhelp.backend.service;

import com.medhelp.backend.config.JwtConfigProperties;
import com.medhelp.backend.model.RefreshToken;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.RefreshTokenRepository;
import com.medhelp.backend.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TokenService {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
    private static final SecureRandom secureRandom = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtConfigProperties jwtConfig;
    private final JwtUtils jwtUtils;

    /**
     * Generate a random refresh token
     */
    private String generateRandomToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Hash a token using SHA-256
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to hash token", e);
        }
    }

    /**
     * Create and persist a refresh token
     */
    @Transactional
    public String createRefreshToken(User user, String deviceFingerprint, String ipAddress, String userAgent) {
        String token = generateRandomToken();
        String tokenHash = hashToken(token);

        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(jwtConfig.getRefreshTokenExpiration() / 1000);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .user(user)
                .deviceFingerprint(deviceFingerprint)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .expiresAt(expiresAt)
                .isRevoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("Created refresh token for user: {}", user.getEmail());

        return token;
    }

    /**
     * Validate and rotate refresh token
     */
    @Transactional
    public Optional<RefreshToken> validateAndRotate(String token) {
        String tokenHash = hashToken(token);
        
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByTokenHash(tokenHash);
        
        if (optionalRefreshToken.isEmpty()) {
            log.warn("Refresh token not found in database");
            return Optional.empty();
        }

        RefreshToken refreshToken = optionalRefreshToken.get();

        // Check if token is valid
        if (!refreshToken.isValid()) {
            log.warn("Refresh token is invalid (expired or revoked) for user: {}", 
                    refreshToken.getUser().getEmail());
            return Optional.empty();
        }

        // Revoke the old token
        refreshToken.setIsRevoked(true);
        refreshToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);

        // Create a new refresh token (rotation)
        String newToken = createRefreshToken(
                refreshToken.getUser(),
                refreshToken.getDeviceFingerprint(),
                refreshToken.getIpAddress(),
                refreshToken.getUserAgent()
        );

        log.debug("Rotated refresh token for user: {}", refreshToken.getUser().getEmail());

        return Optional.of(refreshToken);
    }

    /**
     * Revoke a specific refresh token
     */
    @Transactional
    public void revokeToken(String token) {
        String tokenHash = hashToken(token);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(refreshToken -> {
            refreshToken.setIsRevoked(true);
            refreshToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(refreshToken);
            log.debug("Revoked refresh token for user: {}", refreshToken.getUser().getEmail());
        });
    }

    /**
     * Revoke all refresh tokens for a user (logout from all devices)
     */
    @Transactional
    public void revokeAllTokensForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
        log.info("Revoked all refresh tokens for user: {}", user.getEmail());
    }

    /**
     * Get all active sessions for a user
     */
    public List<RefreshToken> getActiveTokensForUser(User user) {
        return refreshTokenRepository.findAllByUserAndIsRevokedFalse(user);
    }

    /**
     * Set refresh token as HttpOnly cookie
     */
    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Only send over HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtConfig.getRefreshTokenExpiration() / 1000));
        cookie.setAttribute("SameSite", "Strict");
        
        response.addCookie(cookie);
        log.debug("Set refresh token cookie");
    }

    /**
     * Get refresh token from HttpOnly cookie
     */
    public Optional<String> getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    /**
     * Clear refresh token cookie
     */
    public void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        
        response.addCookie(cookie);
        log.debug("Cleared refresh token cookie");
    }

    /**
     * Scheduled job to clean up expired/revoked tokens (runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        refreshTokenRepository.deleteExpiredOrRevoked(LocalDateTime.now());
        log.info("Cleaned up expired and revoked refresh tokens");
    }
}
