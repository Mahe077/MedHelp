package com.medhelp.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Email Notifications
    @Column(name = "email_prescription_ready", nullable = false)
    @Builder.Default
    private Boolean emailPrescriptionReady = true;

    @Column(name = "email_order_updates", nullable = false)
    @Builder.Default
    private Boolean emailOrderUpdates = true;

    @Column(name = "email_promotions", nullable = false)
    @Builder.Default
    private Boolean emailPromotions = false;

    @Column(name = "email_newsletter", nullable = false)
    @Builder.Default
    private Boolean emailNewsletter = true;

    @Column(name = "email_security_alerts", nullable = false)
    @Builder.Default
    private Boolean emailSecurityAlerts = true;

    // SMS Notifications
    @Column(name = "sms_prescription_ready", nullable = false)
    @Builder.Default
    private Boolean smsPrescriptionReady = true;

    @Column(name = "sms_order_updates", nullable = false)
    @Builder.Default
    private Boolean smsOrderUpdates = false;

    @Column(name = "sms_promotions", nullable = false)
    @Builder.Default
    private Boolean smsPromotions = false;

    @Column(name = "sms_security_alerts", nullable = false)
    @Builder.Default
    private Boolean smsSecurityAlerts = true;

    // Push Notifications
    @Column(name = "push_prescription_ready", nullable = false)
    @Builder.Default
    private Boolean pushPrescriptionReady = true;

    @Column(name = "push_order_updates", nullable = false)
    @Builder.Default
    private Boolean pushOrderUpdates = true;

    @Column(name = "push_promotions", nullable = false)
    @Builder.Default
    private Boolean pushPromotions = false;

    @Column(name = "push_security_alerts", nullable = false)
    @Builder.Default
    private Boolean pushSecurityAlerts = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
