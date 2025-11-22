package com.medhelp.backend.service;

import com.medhelp.backend.dto.*;
import com.medhelp.backend.model.*;
import com.medhelp.backend.repository.BranchRepository;
import com.medhelp.backend.repository.RoleRepository;
import com.medhelp.backend.security.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final TwoFactorService twoFactorService;
    private final TokenService tokenService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;
    private final RateLimitService rateLimitService;
    private final DeviceService deviceService;
    private final EmailService emailService;

    @Value("${application.auth.lock-duration-minutes:30}")
    private int lockDurationMinutes;

    @Value("${application.auth.email-verification.enabled:false}")
    private boolean emailVerificationEnabled;

    // Temporary storage for MFA sessions (in production, use Redis)
    private final Map<String, PendingMfaSession> pendingMfaSessions = new ConcurrentHashMap<>();

    /**
     * Register new user
     */
    @Transactional
    public LoginResponse register(
            RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        // Check if email already exists
        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Check if username already exists (if provided)
        if (request.getUsername() != null && userService.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        // Get role and branch
        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
        } else if (request.getRole() != null) {
            role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));
        } else {
            // Default role if not specified
            role = roleRepository.findByName("PATIENT")
                    .orElseThrow(() -> new RuntimeException("Default role PATIENT not found"));
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
        }

        boolean isEnabled = !emailVerificationEnabled;

        // Create user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(role))
                .branch(branch)
                .userType(request.getUserType() != null ? request.getUserType()
                        : (role.getName().equals("PATIENT") ? UserType.EXTERNAL : UserType.INTERNAL))
                .enabled(isEnabled)
                .emailVerified(isEnabled)
                .accountLocked(false)
                .failedLoginAttempts(0)
                .build();

        User savedUser = userService.saveUser(user);

        // Send verification email
        emailVerificationService.sendVerificationEmail(savedUser);

        // Send welcome email
        emailService.sendWelcomeEmail(savedUser);

        log.info("New user registered: {}", savedUser.getEmail());

        // Return response indicating email verification needed
        return LoginResponse.builder()
                .accessToken(null)
                .user(mapToUserResponse(savedUser))
                .mfaRequired(false)
                .build();
    }

    /**
     * Authenticate user (login)
     */
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.getEmail();
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        // Check rate limiting
        if (rateLimitService.isEmailRateLimited(email) || rateLimitService.isIpRateLimited(ipAddress)) {
            rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, false, "Rate limited");
            throw new RuntimeException("Too many login attempts. Please try again later.");
        }

        User user;
        try {
            // Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));

            user = userService.getUserByEmail(email);
        } catch (Exception e) {
            // Record failed attempt
            rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, false, "Invalid credentials");

            // Try to get user to update failed attempts
            try {
                User failedUser = userService.getUserByEmail(email);
                boolean isLocked = rateLimitService.handleFailedLogin(failedUser);
                userService.saveUser(failedUser);

                if (isLocked) {
                    emailService.sendAccountLockedEmail(failedUser, lockDurationMinutes);
                }
            } catch (Exception ignored) {
            }

            throw new BadCredentialsException("Invalid email or password");
        }

        // Check if account is locked
        if (!user.isAccountNonLocked()) {
            rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, false, "Account locked");
            throw new RuntimeException("Account is locked. Please try again later.");
        }

        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }

        // Check if 2FA is enabled
        if (twoFactorService.is2FAEnabled(user)) {
            // Create MFA session
            String sessionId = createMfaSession(user, request.getDeviceFingerprint(), ipAddress, userAgent);

            rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, true, "MFA required");

            return LoginResponse.builder()
                    .accessToken(null)
                    .user(null)
                    .mfaRequired(true)
                    .sessionId(sessionId)
                    .build();
        }

        // Successful login - reset failed attempts
        rateLimitService.handleSuccessfulLogin(user);
        userService.saveUser(user);

        // Track device
        deviceService.trackDevice(user, request.getDeviceFingerprint(), ipAddress, userAgent);

        // Generate tokens
        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = tokenService.createRefreshToken(
                user,
                request.getDeviceFingerprint(),
                ipAddress,
                userAgent);

        // Set refresh token cookie
        tokenService.setRefreshTokenCookie(httpResponse, refreshToken);

        // Record successful login
        rateLimitService.recordLoginAttempt(email, ipAddress, userAgent, true, null);

        log.info("User logged in: {}", email);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(mapToUserResponse(user))
                .mfaRequired(false)
                .build();
    }

    /**
     * Verify 2FA code from MFA session
     */
    @Transactional
    public LoginResponse verify2FA(String sessionId, String code, HttpServletResponse httpResponse) {
        PendingMfaSession session = pendingMfaSessions.get(sessionId);

        if (session == null) {
            throw new RuntimeException("Invalid or expired session");
        }

        User user = session.getUser();

        // Validate OTP
        if (!twoFactorService.validateOtp(user, code)) {
            throw new BadCredentialsException("Invalid 2FA code");
        }

        // Remove session
        pendingMfaSessions.remove(sessionId);

        // Reset failed attempts
        rateLimitService.handleSuccessfulLogin(user);
        userService.saveUser(user);

        // Track device
        deviceService.trackDevice(user, session.getDeviceFingerprint(), session.getIpAddress(), session.getUserAgent());

        // Generate tokens
        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = tokenService.createRefreshToken(user, session.getDeviceFingerprint(),
                session.getIpAddress(), session.getUserAgent());

        // Set refresh token cookie
        tokenService.setRefreshTokenCookie(httpResponse, refreshToken);

        log.info("2FA verification successful for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .user(mapToUserResponse(user))
                .mfaRequired(false)
                .build();
    }

    /**
     * Refresh access token
     */
    public LoginResponse refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Optional<String> refreshTokenOpt = tokenService.getRefreshTokenFromCookie(httpRequest);

        if (refreshTokenOpt.isEmpty()) {
            throw new RuntimeException("Refresh token not found");
        }

        String refreshTokenValue = refreshTokenOpt.get();

        // Validate and rotate refresh token
        Optional<RefreshToken> validatedToken = tokenService.validateAndRotate(refreshTokenValue);

        if (validatedToken.isEmpty()) {
            tokenService.clearRefreshTokenCookie(httpResponse);
            throw new RuntimeException("Invalid or expired refresh token");
        }

        RefreshToken refreshToken = validatedToken.get();
        User user = refreshToken.getUser();

        // Generate new access token
        String newAccessToken = jwtUtils.generateAccessToken(user);

        // The rotation already created a new refresh token, get it
        // For simplicity, we'll create another one here (in production, optimize this)
        String newRefreshToken = tokenService.createRefreshToken(user,
                refreshToken.getDeviceFingerprint(),
                refreshToken.getIpAddress(),
                refreshToken.getUserAgent());

        // Set new refresh token cookie
        tokenService.setRefreshTokenCookie(httpResponse, newRefreshToken);

        log.debug("Token refreshed for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .user(mapToUserResponse(user))
                .mfaRequired(false)
                .build();
    }

    /**
     * Logout
     */
    @Transactional
    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        Optional<String> refreshTokenOpt = tokenService.getRefreshTokenFromCookie(httpRequest);

        refreshTokenOpt.ifPresent(tokenService::revokeToken);

        tokenService.clearRefreshTokenCookie(httpResponse);

        log.info("User logged out");
    }

    /**
     * Logout from all devices
     */
    @Transactional
    public void logoutAll(User user, HttpServletResponse httpResponse) {
        tokenService.revokeAllTokensForUser(user);
        tokenService.clearRefreshTokenCookie(httpResponse);

        log.info("User logged out from all devices: {}", user.getEmail());
    }

    /**
     * Change password
     */
    @Transactional
    public void changePassword(User user, UpdatePasswordRequest request) {
        // Verify passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userService.saveUser(user);

        // Revoke all refresh tokens for security
        tokenService.revokeAllTokensForUser(user);

        // Send confirmation email
        emailService.sendPasswordChangedEmail(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    private String createMfaSession(User user, String deviceFingerprint, String ipAddress, String userAgent) {
        String sessionId = UUID.randomUUID().toString();
        PendingMfaSession session = new PendingMfaSession(user, deviceFingerprint, ipAddress, userAgent);
        pendingMfaSessions.put(sessionId, session);

        // Clean up after 5 minutes
        new Thread(() -> {
            try {
                Thread.sleep(300000); // 5 minutes
                pendingMfaSessions.remove(sessionId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return sessionId;
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
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
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .permissions(user.getAuthorities().stream()
                        .map(auth -> auth.getAuthority())
                        .collect(Collectors.toList()))
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                .userType(user.getUserType().name())
                .emailVerified(user.getEmailVerified())
                .mfaEnabled(twoFactorService.is2FAEnabled(user))
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // Inner class for MFA session
    private static class PendingMfaSession {
        private final User user;
        private final String deviceFingerprint;
        private final String ipAddress;
        private final String userAgent;

        public PendingMfaSession(User user, String deviceFingerprint, String ipAddress, String userAgent) {
            this.user = user;
            this.deviceFingerprint = deviceFingerprint;
            this.ipAddress = ipAddress;
            this.userAgent = userAgent;
        }

        public User getUser() {
            return user;
        }

        public String getDeviceFingerprint() {
            return deviceFingerprint;
        }

        public String getIpAddress() {
            return ipAddress;
        }

        public String getUserAgent() {
            return userAgent;
        }
    }
}
