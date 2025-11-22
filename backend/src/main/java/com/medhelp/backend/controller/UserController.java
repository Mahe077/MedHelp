package com.medhelp.backend.controller;

import com.medhelp.backend.dto.*;
import com.medhelp.backend.model.NotificationSettings;
import com.medhelp.backend.model.PrivacySettings;
import com.medhelp.backend.model.User;
import com.medhelp.backend.model.UserPreferences;
import com.medhelp.backend.repository.UserRepository;
import com.medhelp.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

        private final UserRepository userRepository;
        private final UserService userService;
        private final AuthenticationService authenticationService;
        private final UserPreferencesService userPreferencesService;
        private final NotificationSettingsService notificationSettingsService;
        private final PrivacySettingsService privacySettingsService;

        @GetMapping("/me")
        public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return ResponseEntity.ok(UserResponse.builder()
                                .id(user.getId())
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .phone(user.getPhone())
                                .dateOfBirth(user.getDateOfBirth())
                                .gender(user.getGender())
                                .address(user.getAddress())
                                .city(user.getCity())
                                .state(user.getState())
                                .postalCode(user.getPostalCode())
                                .country(user.getCountry())
                                .profilePicture(user.getProfilePicture())
                                .roles(user.getRoles().stream().map(role -> role.getName()).toList())
                                .permissions(user.getRoles().stream()
                                                .flatMap(role -> role.getPermissions().stream())
                                                .map(permission -> permission.getName())
                                                .toList())
                                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                                .userType(user.getUserType().name())
                                .emailVerified(user.getEmailVerified())
                                .mfaEnabled(false)
                                .build());
        }

        @PutMapping("/profile")
        public ResponseEntity<UserResponse> updateProfile(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody UpdateProfileRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                User updatedUser = userService.updateProfile(user, request);

                return ResponseEntity.ok(UserResponse.builder()
                                .id(updatedUser.getId())
                                .email(updatedUser.getEmail())
                                .username(updatedUser.getUsername())
                                .firstName(updatedUser.getFirstName())
                                .lastName(updatedUser.getLastName())
                                .phone(updatedUser.getPhone())
                                .dateOfBirth(updatedUser.getDateOfBirth())
                                .gender(updatedUser.getGender())
                                .address(updatedUser.getAddress())
                                .city(updatedUser.getCity())
                                .state(updatedUser.getState())
                                .postalCode(updatedUser.getPostalCode())
                                .country(updatedUser.getCountry())
                                .profilePicture(updatedUser.getProfilePicture())
                                .roles(updatedUser.getRoles().stream().map(role -> role.getName()).toList())
                                .permissions(updatedUser.getRoles().stream()
                                                .flatMap(role -> role.getPermissions().stream())
                                                .map(permission -> permission.getName())
                                                .toList())
                                .branchName(updatedUser.getBranch() != null ? updatedUser.getBranch().getName() : null)
                                .userType(updatedUser.getUserType().name())
                                .emailVerified(updatedUser.getEmailVerified())
                                .mfaEnabled(false)
                                .build());
        }

        @PutMapping("/password")
        public ResponseEntity<MessageResponse> changePassword(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody UpdatePasswordRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                authenticationService.changePassword(user, request);

                return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
        }

        @GetMapping("/preferences")
        public ResponseEntity<UserPreferences> getUserPreferences(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserPreferences preferences = userPreferencesService.getUserPreferences(user.getId());
                return ResponseEntity.ok(preferences);
        }

        @PutMapping("/preferences")
        public ResponseEntity<UserPreferences> updatePreferences(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody UserPreferencesRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserPreferences preferences = userPreferencesService.updatePreferences(user.getId(), request);
                return ResponseEntity.ok(preferences);
        }

        @GetMapping("/notifications")
        public ResponseEntity<NotificationSettings> getNotificationSettings(
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                NotificationSettings settings = notificationSettingsService.getNotificationSettings(user.getId());
                return ResponseEntity.ok(settings);
        }

        @PutMapping("/notifications")
        public ResponseEntity<NotificationSettings> updateNotificationSettings(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody NotificationSettingsRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                NotificationSettings settings = notificationSettingsService.updateNotificationSettings(user.getId(),
                                request);
                return ResponseEntity.ok(settings);
        }

        @GetMapping("/privacy")
        public ResponseEntity<PrivacySettings> getPrivacySettings(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                PrivacySettings settings = privacySettingsService.getPrivacySettings(user.getId());
                return ResponseEntity.ok(settings);
        }

        @PutMapping("/privacy")
        public ResponseEntity<PrivacySettings> updatePrivacySettings(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @Valid @RequestBody PrivacySettingsRequest request) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                PrivacySettings settings = privacySettingsService.updatePrivacySettings(user.getId(), request);
                return ResponseEntity.ok(settings);
        }

        @PostMapping("/export-data")
        public ResponseEntity<MessageResponse> exportUserData(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String message = userService.exportUserData(user);
                return ResponseEntity.ok(new MessageResponse(message));
        }

        @DeleteMapping("/account")
        public ResponseEntity<MessageResponse> deleteAccount(@AuthenticationPrincipal UserDetails userDetails) {
                User user = userRepository.findByEmail(userDetails.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                userService.deleteAccount(user);
                return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        }
}
