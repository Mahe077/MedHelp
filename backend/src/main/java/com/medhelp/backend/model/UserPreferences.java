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
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "language", nullable = false)
    @Builder.Default
    private String language = "en";

    @Column(name = "timezone", nullable = false)
    @Builder.Default
    private String timezone = "America/New_York";

    @Column(name = "date_format", nullable = false)
    @Builder.Default
    private String dateFormat = "MM/DD/YYYY";

    @Column(name = "time_format", nullable = false)
    @Builder.Default
    private String timeFormat = "12h";

    @Column(name = "theme", nullable = false)
    @Builder.Default
    private String theme = "light";

    @Column(name = "default_branch_id")
    private Long defaultBranchId;

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
