package com.medhelp.backend.service;

import com.medhelp.backend.model.EmailVerificationToken;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.EmailVerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final UserService userService;

    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("${application.email.verification.expiry-hours:24}")
    private int expiryHours;

    /**
     * Generate and send email verification token
     */
    @Transactional
    public void sendVerificationEmail(User user) {
        // Delete any existing verification tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new token
        String token = generateToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(expiryHours);

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(expiresAt)
                .build();

        tokenRepository.save(verificationToken);

        // Send email
        emailService.sendVerificationEmail(user, token);
        log.info("Sent verification email to: {}", user.getEmail());
    }

    /**
     * Verify email with token
     */
    @Transactional
    public boolean verifyEmail(String token) {
        Optional<EmailVerificationToken> optionalToken = tokenRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            log.warn("Verification token not found");
            return false;
        }

        EmailVerificationToken verificationToken = optionalToken.get();

        if (!verificationToken.isValid()) {
            log.warn("Verification token is invalid or expired");
            return false;
        }

        // Mark user as verified
        User user = verificationToken.getUser();
        user.verifyEmail();
        userService.saveUser(user);

        // Mark token as used
        verificationToken.setVerifiedAt(LocalDateTime.now());
        tokenRepository.save(verificationToken);

        log.info("Email verified for user: {}", user.getEmail());
        return true;
    }

    /**
     * Resend verification email
     */
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userService.getUserByEmail(email);

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        sendVerificationEmail(user);
    }

    private String generateToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Cleanup expired tokens (runs daily at 4 AM)
     */
    @Scheduled(cron = "0 0 4 * * *")
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredOrUsed(LocalDateTime.now());
        log.info("Cleaned up expired email verification tokens");
    }
}
