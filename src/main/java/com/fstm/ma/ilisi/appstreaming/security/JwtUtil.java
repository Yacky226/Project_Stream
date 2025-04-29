package com.fstm.ma.ilisi.appstreaming.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import org.springframework.security.core.userdetails.UserDetails;


import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "maCleSecreteSuperSecurisee";

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 heures

    public String generateToken(UserDetails userDetails) {
        String email = userDetails.getUsername(); // généralement l'email
        String role = userDetails.getAuthorities().stream()
            .findFirst().get().getAuthority(); // on récupère le rôle principal

        return Jwts.builder()
            .setSubject(email) // identifiant principal du token
            .claim("role", role) // on ajoute le rôle dans le token
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // durée de validité
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // algorithme de signature
            .compact(); // on construit le token
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
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }


}
