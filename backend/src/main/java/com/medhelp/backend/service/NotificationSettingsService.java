package com.medhelp.backend.service;

import com.medhelp.backend.dto.NotificationSettingsRequest;
import com.medhelp.backend.model.NotificationSettings;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.NotificationSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationSettingsService {

    private final NotificationSettingsRepository notificationSettingsRepository;

    @Transactional
    public NotificationSettings getNotificationSettings(Long userId) {
        return notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
    }

    @Transactional
    public NotificationSettings updateNotificationSettings(Long userId, NotificationSettingsRequest request) {
        NotificationSettings settings = notificationSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        // Email notifications
        settings.setEmailPrescriptionReady(request.getEmailPrescriptionReady());
        settings.setEmailOrderUpdates(request.getEmailOrderUpdates());
        settings.setEmailPromotions(request.getEmailPromotions());
        settings.setEmailNewsletter(request.getEmailNewsletter());
        settings.setEmailSecurityAlerts(request.getEmailSecurityAlerts());

        // SMS notifications
        settings.setSmsPrescriptionReady(request.getSmsPrescriptionReady());
        settings.setSmsOrderUpdates(request.getSmsOrderUpdates());
        settings.setSmsPromotions(request.getSmsPromotions());
        settings.setSmsSecurityAlerts(request.getSmsSecurityAlerts());

        // Push notifications
        settings.setPushPrescriptionReady(request.getPushPrescriptionReady());
        settings.setPushOrderUpdates(request.getPushOrderUpdates());
        settings.setPushPromotions(request.getPushPromotions());
        settings.setPushSecurityAlerts(request.getPushSecurityAlerts());

        return notificationSettingsRepository.save(settings);
    }

    @Transactional
    public NotificationSettings createDefaultSettings(Long userId) {
        log.info("Creating default notification settings for user: {}", userId);

        User user = new User();
        user.setId(userId);

        NotificationSettings settings = NotificationSettings.builder()
                .user(user)
                .emailPrescriptionReady(true)
                .emailOrderUpdates(true)
                .emailPromotions(false)
                .emailNewsletter(true)
                .emailSecurityAlerts(true)
                .smsPrescriptionReady(true)
                .smsOrderUpdates(false)
                .smsPromotions(false)
                .smsSecurityAlerts(true)
                .pushPrescriptionReady(true)
                .pushOrderUpdates(true)
                .pushPromotions(false)
                .pushSecurityAlerts(true)
                .build();

        return notificationSettingsRepository.save(settings);
    }

    @Transactional
    public void deleteNotificationSettings(Long userId) {
        notificationSettingsRepository.deleteByUserId(userId);
    }
}
