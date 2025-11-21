package com.medhelp.backend.repository;

import com.medhelp.backend.model.EmailVerificationToken;
import com.medhelp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    Optional<EmailVerificationToken> findByUser(User user);

    @Transactional
    void deleteByUser(User user);

    @Transactional
    @Modifying
    @Query("DELETE FROM EmailVerificationToken evt WHERE evt.expiresAt < :now OR evt.verifiedAt IS NOT NULL")
    void deleteExpiredOrUsed(LocalDateTime now);
}
