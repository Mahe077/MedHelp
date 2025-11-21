package com.medhelp.backend.repository;

import com.medhelp.backend.model.RefreshToken;
import com.medhelp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    Optional<RefreshToken> findByUserAndDeviceFingerprint(User user, String deviceFingerprint);

    List<RefreshToken> findAllByUser(User user);

    List<RefreshToken> findAllByUserAndIsRevokedFalse(User user);

    @Transactional
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.revokedAt = :revokedAt WHERE rt.user = :user")
    void revokeAllByUser(User user, LocalDateTime revokedAt);

    @Transactional
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < :now OR rt.isRevoked = true")
    void deleteExpiredOrRevoked(LocalDateTime now);

    @Transactional
    void deleteByTokenHash(String tokenHash);

    @Transactional
    void deleteAllByUser(User user);
}
