package com.medhelp.backend.repository;

import com.medhelp.backend.model.MfaSettings;
import com.medhelp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MfaSettingsRepository extends JpaRepository<MfaSettings, Long> {

    Optional<MfaSettings> findByUser(User user);

    Optional<MfaSettings> findByUserAndEnabledTrue(User user);

    boolean existsByUserAndEnabledTrue(User user);
}
