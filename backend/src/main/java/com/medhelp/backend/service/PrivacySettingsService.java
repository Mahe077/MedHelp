package com.medhelp.backend.service;

import com.medhelp.backend.dto.PrivacySettingsRequest;
import com.medhelp.backend.model.PrivacySettings;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.PrivacySettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrivacySettingsService {

    private final PrivacySettingsRepository privacySettingsRepository;

    @Transactional
    public PrivacySettings getPrivacySettings(Long userId) {
        return privacySettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
    }

    @Transactional
    public PrivacySettings updatePrivacySettings(Long userId, PrivacySettingsRequest request) {
        PrivacySettings settings = privacySettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        settings.setShareDataWithPartners(request.getShareDataWithPartners());
        settings.setMarketingCommunications(request.getMarketingCommunications());
        settings.setProfileVisibility(request.getProfileVisibility());
        settings.setShowOnlineStatus(request.getShowOnlineStatus());

        return privacySettingsRepository.save(settings);
    }

    @Transactional
    public PrivacySettings createDefaultSettings(Long userId) {
        log.info("Creating default privacy settings for user: {}", userId);

        User user = new User();
        user.setId(userId);

        PrivacySettings settings = PrivacySettings.builder()
                .user(user)
                .shareDataWithPartners(false)
                .marketingCommunications(false)
                .profileVisibility(true)
                .showOnlineStatus(true)
                .build();

        return privacySettingsRepository.save(settings);
    }

    @Transactional
    public void deletePrivacySettings(Long userId) {
        privacySettingsRepository.deleteByUserId(userId);
    }
}
