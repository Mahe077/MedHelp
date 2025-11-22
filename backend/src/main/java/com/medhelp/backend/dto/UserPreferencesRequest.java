package com.medhelp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesRequest {

    @NotBlank(message = "Language is required")
    @Size(max = 10, message = "Language code must not exceed 10 characters")
    private String language;

    @NotBlank(message = "Timezone is required")
    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;

    @NotBlank(message = "Date format is required")
    @Size(max = 20, message = "Date format must not exceed 20 characters")
    private String dateFormat;

    @NotBlank(message = "Time format is required")
    @Size(max = 10, message = "Time format must not exceed 10 characters")
    private String timeFormat;

    @NotBlank(message = "Theme is required")
    @Size(max = 20, message = "Theme must not exceed 20 characters")
    private String theme;

    private Long defaultBranchId;
}
