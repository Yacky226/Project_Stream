package com.fstm.ma.ilisi.appstreaming.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final long accessTokenExpiration;
    
    public JwtUtil(
            @Value("${jwt.secret:maCleSecreteSuperSecurisee1234567890}") String secretKey,
            @Value("${jwt.access-token.expiration:3600000}") long accessTokenExpiration) {
        // Convertir la clé secrète en SecretKey pour HMAC-SHA
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.accessTokenExpiration = accessTokenExpiration; // 1 heure par défaut
    }

    public String generateToken(UserDetails userDetails) {
        String email = userDetails.getUsername(); // généralement l'email
        String role = userDetails.getAuthorities().stream()
            .findFirst()
            .map(Object::toString)
            .orElse(""); // Récupérer le rôle principal

        return Jwts.builder()
            .subject(email) // Nouvelle API fluide
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(key) // Utiliser SecretKey au lieu de SignatureAlgorithm et String
            .compact();
    }

    /**
     * Génère un access token avec un userId additionnel.
     */
    public String generateToken(UserDetails userDetails, Long userId) {
        String email = userDetails.getUsername();
        String role = userDetails.getAuthorities().stream()
            .findFirst()
            .map(Object::toString)
            .orElse("");

        return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .claim("userId", userId)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
            .signWith(key)
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(key) // Nouvelle API pour vérifier la signature
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    /**
     * Retourne la durée de validité de l'access token en secondes.
     */
    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpiration / 1000;
    }
}