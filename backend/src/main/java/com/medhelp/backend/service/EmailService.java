package com.medhelp.backend.service;

import com.medhelp.backend.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${application.email.from-name:MedHelp}")
    private String fromName;

    @Value("${application.mail.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("email", user.getEmail());

            String subject = "Welcome to MedHelp!";
            String htmlContent = templateEngine.process("email/welcome", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent welcome email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendVerificationEmail(User user, String token) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("verificationLink", frontendUrl + "/auth/verify-email?token=" + token);
            context.setVariable("expiryHours", 24);

            String subject = "Verify Your Email Address";
            String htmlContent = templateEngine.process("email/verify-email", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent verification email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("resetLink", frontendUrl + "/auth/reset-password?token=" + token);
            context.setVariable("expiryHours", 1);

            String subject = "Reset Your Password";
            String htmlContent = templateEngine.process("email/reset-password", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent password reset email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendNewDeviceLoginAlert(User user, String deviceName, String ipAddress, LocalDateTime loginTime) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("deviceName", deviceName);
            context.setVariable("ipAddress", ipAddress);
            context.setVariable("loginTime", loginTime);
            context.setVariable("securityUrl", frontendUrl + "/settings/security");

            String subject = "New Device Login Detected";
            String htmlContent = templateEngine.process("email/new-device-alert", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent new device alert email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send new device alert email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendAccountLockedEmail(User user, int lockDurationMinutes) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("lockDurationMinutes", lockDurationMinutes);
            context.setVariable("supportEmail", fromEmail);

            String subject = "Your Account Has Been Locked";
            String htmlContent = templateEngine.process("email/account-locked", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent account locked email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send account locked email to: {}", user.getEmail(), e);
        }
    }

    @Async
    public void sendPasswordChangedEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("userName", user.getUsername() != null ? user.getUsername() : user.getEmail());
            context.setVariable("changeTime", LocalDateTime.now());
            context.setVariable("supportEmail", fromEmail);

            String subject = "Your Password Has Been Changed";
            String htmlContent = templateEngine.process("email/password-changed", context);

            sendHtmlEmail(user.getEmail(), subject, htmlContent);
            log.info("Sent password changed email to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password changed email to: {}", user.getEmail(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message,
                MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                StandardCharsets.UTF_8.name());

        try { // Added try-catch for UnsupportedEncodingException
            helper.setFrom(fromEmail, fromName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmail); // Fallback if encoding is not supported
            log.warn(
                    "UnsupportedEncodingException when setting 'from' address for email to {}. Using plain email address.",
                    to, e);
        }
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }
}
