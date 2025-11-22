package com.medhelp.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationSettingsRequest {

    // Email Notifications
    @NotNull(message = "Email prescription ready setting is required")
    private Boolean emailPrescriptionReady;

    @NotNull(message = "Email order updates setting is required")
    private Boolean emailOrderUpdates;

    @NotNull(message = "Email promotions setting is required")
    private Boolean emailPromotions;

    @NotNull(message = "Email newsletter setting is required")
    private Boolean emailNewsletter;

    @NotNull(message = "Email security alerts setting is required")
    private Boolean emailSecurityAlerts;

    // SMS Notifications
    @NotNull(message = "SMS prescription ready setting is required")
    private Boolean smsPrescriptionReady;

    @NotNull(message = "SMS order updates setting is required")
    private Boolean smsOrderUpdates;

    @NotNull(message = "SMS promotions setting is required")
    private Boolean smsPromotions;

    @NotNull(message = "SMS security alerts setting is required")
    private Boolean smsSecurityAlerts;

    // Push Notifications
    @NotNull(message = "Push prescription ready setting is required")
    private Boolean pushPrescriptionReady;

    @NotNull(message = "Push order updates setting is required")
    private Boolean pushOrderUpdates;

    @NotNull(message = "Push promotions setting is required")
    private Boolean pushPromotions;

    @NotNull(message = "Push security alerts setting is required")
    private Boolean pushSecurityAlerts;
}
