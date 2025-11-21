package com.medhelp.backend.controller;

import com.medhelp.backend.model.AuthDevice;
import com.medhelp.backend.model.User;
import com.medhelp.backend.service.DeviceService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserManagementController {

    private final DeviceService deviceService;

    @GetMapping("/devices")
    public ResponseEntity<List<DeviceResponse>> getDevices(@AuthenticationPrincipal User user) {
        List<AuthDevice> devices = deviceService.getUserDevices(user);
        
        List<DeviceResponse> response = devices.stream()
                .map(device -> DeviceResponse.builder()
                        .id(device.getId())
                        .deviceName(device.getDeviceName())
                        .lastIp(device.getLastIp())
                        .lastSeen(device.getLastSeen())
                        .firstSeen(device.getFirstSeen())
                        .isTrusted(device.getIsTrusted())
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/devices/{deviceId}/trust")
    public ResponseEntity<Void> trustDevice(
            @PathVariable Long deviceId,
            @AuthenticationPrincipal User user
    ) {
        deviceService.trustDevice(deviceId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/devices/{deviceId}")
    public ResponseEntity<Void> removeDevice(
            @PathVariable Long deviceId,
            @AuthenticationPrincipal User user
    ) {
        deviceService.removeDevice(deviceId, user);
        return ResponseEntity.ok().build();
    }

    // Inner DTO
    @Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceResponse {
        private Long id;
        private String deviceName;
        private String lastIp;
        private LocalDateTime lastSeen;
        private LocalDateTime firstSeen;
        private Boolean isTrusted;
    }
}
