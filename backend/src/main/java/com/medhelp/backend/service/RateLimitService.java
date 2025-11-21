package com.medhelp.backend.service;

import com.medhelp.backend.model.LoginAttempt;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.LoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitService {

    private final LoginAttemptRepository loginAttemptRepository;

    @Value("${application.auth.rate-limit.login-attempts:10}")
    private int maxLoginAttempts;

    @Value("${application.auth.rate-limit.window-seconds:300}")
    private int windowSeconds;

    @Value("${application.auth.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${application.auth.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    /**
     * Record a login attempt
     */
    @Transactional
    public void recordLoginAttempt(String email, String ipAddress, String userAgent, boolean success, String failureReason) {
        LoginAttempt attempt = LoginAttempt.builder()
                .email(email)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .success(success)
                .failureReason(failureReason)
                .build();

        loginAttemptRepository.save(attempt);
    }

    /**
     * Check if email has exceeded rate limit
     */
    public boolean isEmailRateLimited(String email) {
        LocalDateTime since = LocalDateTime.now().minusSeconds(windowSeconds);
        long failedAttempts = loginAttemptRepository.countFailedAttemptsByEmail(email, since);
        
        if (failedAttempts >= maxLoginAttempts) {
            log.warn("Rate limit exceeded for email: {}", email);
            return true;
        }
        return false;
    }

    /**
     * Check if IP address has exceeded rate limit
     */
    public boolean isIpRateLimited(String ipAddress) {
        LocalDateTime since = LocalDateTime.now().minusSeconds(windowSeconds);
        long failedAttempts = loginAttemptRepository.countFailedAttemptsByIpAddress(ipAddress, since);
        
        if (failedAttempts >= maxLoginAttempts) {
            log.warn("Rate limit exceeded for IP: {}", ipAddress);
            return true;
        }
        return false;
    }

    /**
     * Handle failed login attempt for a user
     */
    @Transactional
    public boolean handleFailedLogin(User user) {
        user.incrementFailedAttempts();
        
        if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
            user.lock(lockDurationMinutes);
            log.warn("Account locked for user: {} after {} failed attempts", 
                    user.getEmail(), user.getFailedLoginAttempts());
            return true; // Account locked
        }
        
        return false; // Not locked yet
    }

    /**
     * Handle successful login
     */
    @Transactional
    public void handleSuccessfulLogin(User user) {
        user.resetFailedAttempts();
    }

    /**
     * Scheduled cleanup of old login attempts (runs daily at 3 AM)
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupOldAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        loginAttemptRepository.deleteOldAttempts(cutoff);
        log.info("Cleaned up login attempts older than 30 days");
    }
}
