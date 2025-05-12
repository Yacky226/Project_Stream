package com.fstm.ma.ilisi.appstreaming.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "maCleSecreteSuperSecurisee1234567890"; // Doit être >= 32 caractères pour HS256
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 heures
    private final SecretKey key;

    public JwtUtil() {
        // Convertir la clé secrète en SecretKey pour HMAC-SHA
        this.key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
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
            .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(key) // Utiliser SecretKey au lieu de SignatureAlgorithm et String
            .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
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
}