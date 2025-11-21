package com.medhelp.backend.service;

import com.medhelp.backend.model.AuthDevice;
import com.medhelp.backend.model.User;
import com.medhelp.backend.repository.AuthDeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final AuthDeviceRepository deviceRepository;
    private final EmailService emailService;

    /**
     * Track device login
     */
    @Transactional
    public AuthDevice trackDevice(User user, String deviceFingerprint, String ipAddress, String userAgent) {
        Optional<AuthDevice> existingDevice = deviceRepository.findByUserAndDeviceFingerprint(user, deviceFingerprint);

        if (existingDevice.isPresent()) {
            // Update existing device
            AuthDevice device = existingDevice.get();
            device.updateLastSeen(ipAddress, userAgent);
            return deviceRepository.save(device);
        } else {
            // New device - create and send alert
            AuthDevice newDevice = AuthDevice.builder()
                    .user(user)
                    .deviceFingerprint(deviceFingerprint)
                    .deviceName(extractDeviceName(userAgent))
                    .lastIp(ipAddress)
                    .lastUserAgent(userAgent)
                    .isTrusted(false)
                    .build();

            AuthDevice saved = deviceRepository.save(newDevice);

            // Send new device alert email
            emailService.sendNewDeviceLoginAlert(user, saved.getDeviceName(), ipAddress, LocalDateTime.now());

            log.info("New device registered for user: {}", user.getEmail());
            return saved;
        }
    }

    /**
     * Get all devices for a user
     */
    public List<AuthDevice> getUserDevices(User user) {
        return deviceRepository.findAllByUserOrderByLastSeenDesc(user);
    }

    /**
     * Trust a device
     */
    @Transactional
    public void trustDevice(Long deviceId, User user) {
        deviceRepository.findById(deviceId).ifPresent(device -> {
            if (device.getUser().getId().equals(user.getId())) {
                device.setIsTrusted(true);
                deviceRepository.save(device);
                log.info("Device {} trusted for user: {}", deviceId, user.getEmail());
            }
        });
    }

    /**
     * Remove a device
     */
    @Transactional
    public void removeDevice(Long deviceId, User user) {
        deviceRepository.findById(deviceId).ifPresent(device -> {
            if (device.getUser().getId().equals(user.getId())) {
                deviceRepository.delete(device);
                log.info("Device {} removed for user: {}", deviceId, user.getEmail());
            }
        });
    }

    /**
     * Extract device name from user agent
     */
    private String extractDeviceName(String userAgent) {
        if (userAgent == null) {
            return "Unknown Device";
        }

        userAgent = userAgent.toLowerCase();

        // Mobile devices
        if (userAgent.contains("iphone")) return "iPhone";
        if (userAgent.contains("ipad")) return "iPad";
        if (userAgent.contains("android")) return "Android Device";

        // Browsers
        if (userAgent.contains("chrome")) return "Chrome Browser";
        if (userAgent.contains("firefox")) return "Firefox Browser";
        if (userAgent.contains("safari")) return "Safari Browser";
        if (userAgent.contains("edge")) return "Edge Browser";

        return "Web Browser";
    }
}
