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
public class PrivacySettingsRequest {

    @NotNull(message = "Share data with partners setting is required")
    private Boolean shareDataWithPartners;

    @NotNull(message = "Marketing communications setting is required")
    private Boolean marketingCommunications;

    @NotNull(message = "Profile visibility setting is required")
    private Boolean profileVisibility;

    @NotNull(message = "Show online status setting is required")
    private Boolean showOnlineStatus;
}
