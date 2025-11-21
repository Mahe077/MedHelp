package com.medhelp.backend.repository;

import com.medhelp.backend.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    @Query("SELECT la FROM LoginAttempt la WHERE la.email = :email AND la.attemptedAt > :since ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findRecentByEmail(String email, LocalDateTime since);

    @Query("SELECT la FROM LoginAttempt la WHERE la.ipAddress = :ipAddress AND la.attemptedAt > :since ORDER BY la.attemptedAt DESC")
    List<LoginAttempt> findRecentByIpAddress(String ipAddress, LocalDateTime since);

    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.email = :email AND la.success = false AND la.attemptedAt > :since")
    long countFailedAttemptsByEmail(String email, LocalDateTime since);

    @Query("SELECT COUNT(la) FROM LoginAttempt la WHERE la.ipAddress = :ipAddress AND la.success = false AND la.attemptedAt > :since")
    long countFailedAttemptsByIpAddress(String ipAddress, LocalDateTime since);

    @Transactional
    @Modifying
    @Query("DELETE FROM LoginAttempt la WHERE la.attemptedAt < :olderThan")
    void deleteOldAttempts(LocalDateTime olderThan);
}
