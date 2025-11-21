package com.medhelp.backend.service;

import com.medhelp.backend.model.PasswordResetToken;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("${application.email.reset.expiry-hours:1}")
    private int expiryHours;

    /**
     * Initiate password reset flow
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        try {
            User user = userService.getUserByEmail(email);

            // Delete any existing reset tokens for this user
            tokenRepository.deleteByUser(user);

            // Generate new token
            String token = generateToken();
            LocalDateTime expiresAt = LocalDateTime.now().plusHours(expiryHours);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(expiresAt)
                    .build();

            tokenRepository.save(resetToken);

            // Send email
            emailService.sendPasswordResetEmail(user, token);
            log.info("Sent password reset email to: {}", email);
        } catch (Exception e) {
            // Don't reveal if email exists or not for security
            log.warn("Password reset request for email: {}", email);
        }
    }

    /**
     * Reset password with token
     */
    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optionalToken = tokenRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            log.warn("Reset token not found");
            return false;
        }

        PasswordResetToken resetToken = optionalToken.get();

        if (!resetToken.isValid()) {
            log.warn("Reset token is invalid or expired");
            return false;
        }

        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.resetFailedAttempts(); // Reset any lockout
        userService.saveUser(user);

        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user);

        log.info("Password reset successful for user: {}", user.getEmail());
        return true;
    }

    /**
     * Validate reset token without using it
     */
    public boolean validateResetToken(String token) {
        return tokenRepository.findByToken(token)
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    private String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Cleanup expired tokens (runs daily at 5 AM)
     */
    @Scheduled(cron = "0 0 5 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredOrUsed(LocalDateTime.now());
        log.info("Cleaned up expired password reset tokens");
    }
}
