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
@Table(name = "privacy_settings")
public class PrivacySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "share_data_with_partners", nullable = false)
    @Builder.Default
    private Boolean shareDataWithPartners = false;

    @Column(name = "marketing_communications", nullable = false)
    @Builder.Default
    private Boolean marketingCommunications = false;

    @Column(name = "profile_visibility", nullable = false)
    @Builder.Default
    private Boolean profileVisibility = true;

    @Column(name = "show_online_status", nullable = false)
    @Builder.Default
    private Boolean showOnlineStatus = true;

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
