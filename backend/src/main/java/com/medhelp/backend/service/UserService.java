package com.medhelp.backend.service;

import com.medhelp.backend.dto.UpdateProfileRequest;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesService userPreferencesService;
    private final NotificationSettingsService notificationSettingsService;
    private final PrivacySettingsService privacySettingsService;

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    @Transactional(readOnly = true)
    public User getUserByEmailOrUsername(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Transactional
    public User updateProfile(User user, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", user.getEmail());

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getState() != null) {
            user.setState(request.getState());
        }
        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(User user) {
        log.warn("Deleting account for user: {}", user.getEmail());

        // Delete related settings
        userPreferencesService.deleteUserPreferences(user.getId());
        notificationSettingsService.deleteNotificationSettings(user.getId());
        privacySettingsService.deletePrivacySettings(user.getId());

        // Soft delete: disable account instead of hard delete
        user.setEnabled(false);
        user.setAccountLocked(true);
        userRepository.save(user);

        log.info("Account soft-deleted for user: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public String exportUserData(User user) {
        log.info("Exporting data for user: {}", user.getEmail());

        // TODO: Implement comprehensive data export
        // This should include user profile, preferences, settings, orders,
        // prescriptions, etc.
        // For now, return a placeholder
        return "Data export functionality will be implemented. User will receive an email when ready.";
    }
}
