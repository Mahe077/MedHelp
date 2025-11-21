package com.medhelp.backend.repository;

import com.medhelp.backend.model.OAuthProvider;
import com.medhelp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OAuthProviderRepository extends JpaRepository<OAuthProvider, Long> {

    Optional<OAuthProvider> findByProviderAndProviderUserId(String provider, String providerUserId);

    List<OAuthProvider> findAllByUser(User user);

    Optional<OAuthProvider> findByUserAndProvider(User user, String provider);

    boolean existsByUserAndProvider(User user, String provider);
}
