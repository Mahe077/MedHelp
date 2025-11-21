package com.medhelp.backend.service;

import com.medhelp.backend.model.MfaSettings;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.MfaSettingsRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.GoogleAuthenticatorQRGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final MfaSettingsRepository mfaSettingsRepository;
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();
    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Enable 2FA for user
     */
    @Transactional
    public MfaSettings enable2FA(User user) {
        Optional<MfaSettings> existing = mfaSettingsRepository.findByUser(user);
        
        MfaSettings settings;
        if (existing.isPresent()) {
            settings = existing.get();
            settings.setEnabled(true);
        } else {
            String secret = generateNewSecret();
            List<String> backupCodes = generateBackupCodes(10);
            
            settings = MfaSettings.builder()
                    .user(user)
                    .enabled(true)
                    .secret(secret)
                    .backupCodes(String.join(",", backupCodes))
                    .build();
        }
        
        MfaSettings saved = mfaSettingsRepository.save(settings);
        log.info("2FA enabled for user: {}", user.getEmail());
        return saved;
    }

    /**
     * Disable 2FA for user
     */
    @Transactional
    public void disable2FA(User user) {
        mfaSettingsRepository.findByUser(user).ifPresent(settings -> {
            settings.setEnabled(false);
            mfaSettingsRepository.save(settings);
            log.info("2FA disabled for user: {}", user.getEmail());
        });
    }

    /**
     * Generate QR code setup data
     */
    @Transactional
    public String setupQRCode(User user) {
        MfaSettings settings = mfaSettingsRepository.findByUser(user)
                .orElseGet(() -> {
                    String secret = generateNewSecret();
                    List<String> backupCodes = generateBackupCodes(10);
                    
                    MfaSettings newSettings = MfaSettings.builder()
                            .user(user)
                            .enabled(false) // Not enabled until verified
                            .secret(secret)
                            .backupCodes(String.join(",", backupCodes))
                            .build();
                    
                    return mfaSettingsRepository.save(newSettings);
                });

        return generateQrCodeImageUri(settings.getSecret(), user.getEmail());
    }

    /**
     * Verify and finalize 2FA setup
     */
    @Transactional
    public boolean verify2FASetup(User user, String code) {
        Optional<MfaSettings> optionalSettings = mfaSettingsRepository.findByUser(user);
        
        if (optionalSettings.isEmpty()) {
            return false;
        }

        MfaSettings settings = optionalSettings.get();
        boolean isValid = isOtpValid(settings.getSecret(), code);
        
        if (isValid && !settings.getEnabled()) {
            settings.setEnabled(true);
            mfaSettingsRepository.save(settings);
            log.info("2FA setup verified for user: {}", user.getEmail());
        }
        
        return isValid;
    }

    /**
     * Validate OTP code
     */
    public boolean validateOtp(User user, String code) {
        return mfaSettingsRepository.findByUserAndEnabledTrue(user)
                .map(settings -> isOtpValid(settings.getSecret(), code) || isBackupCode(settings, code))
                .orElse(false);
    }

    /**
     * Check if user has 2FA enabled
     */
    public boolean is2FAEnabled(User user) {
        return mfaSettingsRepository.existsByUserAndEnabledTrue(user);
    }

    /**
     * Get backup codes for user
     */
    public List<String> getBackupCodes(User user) {
        return mfaSettingsRepository.findByUser(user)
                .map(settings -> List.of(settings.getBackupCodes().split(",")))
                .orElse(List.of());
    }

    /**
     * Regenerate backup codes
     */
    @Transactional
    public List<String> regenerateBackupCodes(User user) {
        List<String> newCodes = generateBackupCodes(10);
        
        mfaSettingsRepository.findByUser(user).ifPresent(settings -> {
            settings.setBackupCodes(String.join(",", newCodes));
            mfaSettingsRepository.save(settings);
            log.info("Backup codes regenerated for user: {}", user.getEmail());
        });
        
        return newCodes;
    }

    private String generateNewSecret() {
        final GoogleAuthenticatorKey key = gAuth.createCredentials();
        return key.getKey();
    }

    private String generateQrCodeImageUri(String secret, String email) {
        GoogleAuthenticatorKey key = new GoogleAuthenticatorKey.Builder(secret).build();
        return GoogleAuthenticatorQRGenerator.getOtpAuthTotpURL("MedHelp", email, key);
    }

    private boolean isOtpValid(String secret, String code) {
        try {
            int verificationCode = Integer.parseInt(code);
            return gAuth.authorize(secret, verificationCode);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private boolean isBackupCode(MfaSettings settings, String code) {
        List<String> codes = List.of(settings.getBackupCodes().split(","));
        return codes.contains(code.trim());
    }

    private List<String> generateBackupCodes(int count) {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            codes.add(String.format("%08d", secureRandom.nextInt(100000000)));
        }
        return codes;
    }
}
