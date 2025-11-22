package com.medhelp.backend.controller;

import com.medhelp.backend.dto.*;
import com.medhelp.backend.model.User;
import com.medhelp.backend.service.AuthenticationService;
import com.medhelp.backend.service.EmailVerificationService;
import com.medhelp.backend.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authenticationService.register(request, httpRequest, httpResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authenticationService.login(request, httpRequest, httpResponse));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<LoginResponse> verify2FA(
            @Valid @RequestBody Verify2FARequest request,
            HttpServletResponse httpResponse) {
        return ResponseEntity
                .ok(authenticationService.verify2FA(request.getSessionId(), request.getCode(), httpResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        return ResponseEntity.ok(authenticationService.refresh(httpRequest, httpResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        authenticationService.logout(httpRequest, httpResponse);
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<MessageResponse> logoutAll(
            @AuthenticationPrincipal User user,
            HttpServletResponse httpResponse) {
        authenticationService.logoutAll(user, httpResponse);
        return ResponseEntity.ok(new MessageResponse("Logged out from all devices"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        boolean verified = emailVerificationService.verifyEmail(request.getToken());
        if (verified) {
            return ResponseEntity.ok(new MessageResponse("Email verified successfully"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired token"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody ForgotPasswordRequest request) {
        emailVerificationService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("Verification email sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok(new MessageResponse("If the email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        boolean reset = passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        if (reset) {
            return ResponseEntity.ok(new MessageResponse("Password reset successfully"));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired token"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal User user) {
        authenticationService.changePassword(user, request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        // Map user to UserResponse (handled in AuthenticationService)
        return ResponseEntity.ok(UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(role -> role.getName()).toList())
                .permissions(user.getAuthorities().stream().map(auth -> auth.getAuthority()).toList())
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                .userType(user.getUserType().name())
                .emailVerified(user.getEmailVerified())
                .build());
    }
}
