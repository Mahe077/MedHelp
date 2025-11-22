package com.medhelp.backend.repository;

import com.medhelp.backend.model.PrivacySettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings, Long> {
    Optional<PrivacySettings> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
