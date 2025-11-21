package com.medhelp.backend.controller;

import com.medhelp.backend.dto.MessageResponse;
import com.medhelp.backend.model.MfaSettings;
import com.medhelp.backend.model.User;
import com.medhelp.backend.service.TwoFactorService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/mfa")
@RequiredArgsConstructor
public class MfaController {

    private final TwoFactorService twoFactorService;

    @GetMapping("/setup")
    public ResponseEntity<MfaSetupResponse> setup(@AuthenticationPrincipal User user) {
        String qrCodeUri = twoFactorService.setupQRCode(user);
        List<String> backupCodes = twoFactorService.getBackupCodes(user);
        
        return ResponseEntity.ok(MfaSetupResponse.builder()
                .qrCodeUri(qrCodeUri)
                .backupCodes(backupCodes)
                .build());
    }

    @PostMapping("/enable")
    public ResponseEntity<MessageResponse> enable(
            @Valid @RequestBody VerifyCodeRequest request,
            @AuthenticationPrincipal User user
    ) {
        boolean verified = twoFactorService.verify2FASetup(user, request.getCode());
        if (verified) {
            return ResponseEntity.ok(new MessageResponse("2FA enabled successfully"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid code"));
    }

    @PostMapping("/disable")
    public ResponseEntity<MessageResponse> disable(@AuthenticationPrincipal User user) {
        twoFactorService.disable2FA(user);
        return ResponseEntity.ok(new MessageResponse("2FA disabled successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<MfaStatusResponse> getStatus(@AuthenticationPrincipal User user) {
        boolean enabled = twoFactorService.is2FAEnabled(user);
        return ResponseEntity.ok(MfaStatusResponse.builder()
                .enabled(enabled)
                .build());
    }

    @GetMapping("/backup-codes")
    public ResponseEntity<BackupCodesResponse> getBackupCodes(@AuthenticationPrincipal User user) {
        List<String> codes = twoFactorService.getBackupCodes(user);
        return ResponseEntity.ok(BackupCodesResponse.builder()
                .codes(codes)
                .build());
    }

    @PostMapping("/backup-codes/regenerate")
    public ResponseEntity<BackupCodesResponse> regenerateBackupCodes(@AuthenticationPrincipal User user) {
        List<String> newCodes = twoFactorService.regenerateBackupCodes(user);
        return ResponseEntity.ok(BackupCodesResponse.builder()
                .codes(newCodes)
                .build());
    }

    // Inner DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyCodeRequest {
        @NotBlank(message = "Code is required")
        private String code;
    }

    @Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MfaSetupResponse {
        private String qrCodeUri;
        private List<String> backupCodes;
    }

    @Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MfaStatusResponse {
        private boolean enabled;
    }

    @Data
    @lombok.Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackupCodesResponse {
        private List<String> codes;
    }
}
