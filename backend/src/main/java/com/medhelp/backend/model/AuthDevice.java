package com.medhelp.backend.model;

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
@Table(name = "auth_devices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "device_fingerprint"})
})
public class AuthDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_fingerprint", nullable = false)
    private String deviceFingerprint;

    @Column(name = "device_name")
    private String deviceName;

    @Column(name = "last_ip", length = 45)
    private String lastIp;

    @Column(name = "last_user_agent", columnDefinition = "TEXT")
    private String lastUserAgent;

    @Column(name = "first_seen", nullable = false, updatable = false)
    private LocalDateTime firstSeen;

    @Column(name = "last_seen", nullable = false)
    private LocalDateTime lastSeen;

    @Column(name = "is_trusted", nullable = false)
    @Builder.Default
    private Boolean isTrusted = false;

    @PrePersist
    protected void onCreate() {
        firstSeen = LocalDateTime.now();
        lastSeen = LocalDateTime.now();
    }

    public void updateLastSeen(String ip, String userAgent) {
        this.lastSeen = LocalDateTime.now();
        this.lastIp = ip;
        this.lastUserAgent = userAgent;
    }
}
