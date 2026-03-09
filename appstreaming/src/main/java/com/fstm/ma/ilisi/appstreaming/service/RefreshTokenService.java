package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.TokenRefreshException;
import com.fstm.ma.ilisi.appstreaming.model.bo.RefreshToken;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.repository.RefreshTokenRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Service gérant les refresh tokens.
 */
@Service
@Transactional
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    
    // Durée de validité du refresh token (7 jours par défaut)
    @Value("${jwt.refresh-token.expiration:604800000}")
    private long refreshTokenDurationMs;
    
    // Nombre maximum de sessions actives par utilisateur
    @Value("${jwt.refresh-token.max-sessions:5}")
    private int maxActiveSessions;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UtilisateurRepository utilisateurRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, 
                               UtilisateurRepository utilisateurRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Crée un nouveau refresh token pour un utilisateur.
     */
    public RefreshToken createRefreshToken(Long utilisateurId, String userAgent, String ipAddress) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier le nombre de sessions actives
        long activeSessions = refreshTokenRepository.countActiveTokensByUtilisateur(utilisateur, Instant.now());
        if (activeSessions >= maxActiveSessions) {
            // Révoquer les anciens tokens pour permettre une nouvelle session
            log.info("Nombre maximum de sessions atteint pour l'utilisateur {}. Révocation des anciens tokens.", utilisateurId);
            refreshTokenRepository.revokeAllByUtilisateur(utilisateur);
        }

        RefreshToken refreshToken = RefreshToken.builder()
                .utilisateur(utilisateur)
                .token(generateToken())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();

        refreshToken = refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token créé pour l'utilisateur {}", utilisateurId);
        
        return refreshToken;
    }

    /**
     * Génère un token unique et sécurisé.
     */
    private String generateToken() {
        return UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
    }

    /**
     * Recherche un refresh token par sa valeur.
     */
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    /**
     * Vérifie si un refresh token est valide (non expiré et non révoqué).
     */
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException(token, "Token non trouvé"));

        if (refreshToken.isRevoked()) {
            log.warn("Tentative d'utilisation d'un refresh token révoqué: {}", token.substring(0, 8));
            throw new TokenRefreshException(token, "Token révoqué. Veuillez vous reconnecter.");
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            log.info("Refresh token expiré supprimé: {}", token.substring(0, 8));
            throw new TokenRefreshException(token, "Token expiré. Veuillez vous reconnecter.");
        }

        return refreshToken;
    }

    /**
     * Révoque un refresh token spécifique (logout).
     */
    public void revokeToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException(token, "Token non trouvé"));
        
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        log.info("Refresh token révoqué: {}", token.substring(0, 8));
    }

    /**
     * Révoque tous les refresh tokens d'un utilisateur (logout de toutes les sessions).
     */
    public void revokeAllUserTokens(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        refreshTokenRepository.revokeAllByUtilisateur(utilisateur);
        log.info("Tous les refresh tokens révoqués pour l'utilisateur {}", utilisateurId);
    }

    /**
     * Révoque tous les refresh tokens d'un utilisateur par son email.
     */
    public void revokeAllUserTokensByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        refreshTokenRepository.revokeAllByUtilisateur(utilisateur);
        log.info("Tous les refresh tokens révoqués pour l'utilisateur {}", email);
    }

    /**
     * Effectue une rotation du refresh token (génère un nouveau token et révoque l'ancien).
     * C'est une bonne pratique de sécurité pour limiter la fenêtre d'utilisation d'un token volé.
     */
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        // Révoquer l'ancien token
        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        // Créer un nouveau token
        RefreshToken newToken = RefreshToken.builder()
                .utilisateur(oldToken.getUtilisateur())
                .token(generateToken())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .userAgent(oldToken.getUserAgent())
                .ipAddress(oldToken.getIpAddress())
                .build();

        newToken = refreshTokenRepository.save(newToken);
        log.debug("Rotation du refresh token effectuée pour l'utilisateur {}", 
                oldToken.getUtilisateur().getId());
        
        return newToken;
    }

    /**
     * Nettoie les tokens expirés (à exécuter périodiquement).
     */
    @Scheduled(cron = "0 0 2 * * ?") // Tous les jours à 2h du matin
    public void cleanupExpiredTokens() {
        int deletedCount = refreshTokenRepository.findAll().stream()
                .filter(RefreshToken::isExpired)
                .peek(refreshTokenRepository::delete)
                .toList()
                .size();
        
        log.info("Nettoyage des refresh tokens expirés: {} tokens supprimés", deletedCount);
    }

    /**
     * Retourne la durée de validité du refresh token en millisecondes.
     */
    public long getRefreshTokenDurationMs() {
        return refreshTokenDurationMs;
    }
}
