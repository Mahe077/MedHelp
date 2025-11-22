package com.medhelp.backend.service;

import com.medhelp.backend.dto.UserPreferencesRequest;
import com.medhelp.backend.model.User;
import com.medhelp.backend.model.UserPreferences;
import com.medhelp.backend.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;

    @Transactional
    public UserPreferences getUserPreferences(Long userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    @Transactional
    public UserPreferences updatePreferences(Long userId, UserPreferencesRequest request) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        preferences.setLanguage(request.getLanguage());
        preferences.setTimezone(request.getTimezone());
        preferences.setDateFormat(request.getDateFormat());
        preferences.setTimeFormat(request.getTimeFormat());
        preferences.setTheme(request.getTheme());
        preferences.setDefaultBranchId(request.getDefaultBranchId());

        return userPreferencesRepository.save(preferences);
    }

    @Transactional
    public UserPreferences createDefaultPreferences(Long userId) {
        log.info("Creating default preferences for user: {}", userId);

        User user = new User();
        user.setId(userId);

        UserPreferences preferences = UserPreferences.builder()
                .user(user)
                .language("en")
                .timezone("America/New_York")
                .dateFormat("MM/DD/YYYY")
                .timeFormat("12h")
                .theme("light")
                .build();

        return userPreferencesRepository.save(preferences);
    }

    @Transactional
    public void deleteUserPreferences(Long userId) {
        userPreferencesRepository.deleteByUserId(userId);
    }
}
