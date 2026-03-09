package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.RefreshToken;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUtilisateurAndRevokedFalse(Utilisateur utilisateur);

    List<RefreshToken> findByUtilisateur(Utilisateur utilisateur);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.utilisateur = :utilisateur")
    void revokeAllByUtilisateur(@Param("utilisateur") Utilisateur utilisateur);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    void deleteAllExpiredTokens(@Param("now") Instant now);

    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.utilisateur = :utilisateur AND rt.revoked = false AND rt.expiryDate > :now")
    long countActiveTokensByUtilisateur(@Param("utilisateur") Utilisateur utilisateur, @Param("now") Instant now);

    boolean existsByTokenAndRevokedFalse(String token);
}
