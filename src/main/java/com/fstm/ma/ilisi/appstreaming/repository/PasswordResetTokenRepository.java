package com.fstm.ma.ilisi.appstreaming.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fstm.ma.ilisi.appstreaming.model.bo.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long> {
    Optional<PasswordResetToken> findByToken(String token);
    PasswordResetToken findByUtilisateurId(Long userId);
}
