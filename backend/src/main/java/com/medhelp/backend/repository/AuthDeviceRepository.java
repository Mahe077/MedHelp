package com.medhelp.backend.repository;

import com.medhelp.backend.model.AuthDevice;
import com.medhelp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthDeviceRepository extends JpaRepository<AuthDevice, Long> {

    Optional<AuthDevice> findByUserAndDeviceFingerprint(User user, String deviceFingerprint);

    List<AuthDevice> findAllByUser(User user);

    List<AuthDevice> findAllByUserOrderByLastSeenDesc(User user);
}
