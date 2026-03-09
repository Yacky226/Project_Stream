package com.fstm.ma.ilisi.appstreaming.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filtre de Rate Limiting pour protéger contre les attaques par force brute.
 * Limite le nombre de requêtes par IP pour les endpoints sensibles.
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    
    // Cache des buckets par IP
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    // Cache des buckets pour les endpoints d'authentification (plus restrictif)
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    
    // Endpoints sensibles à protéger plus strictement
    private static final String[] AUTH_ENDPOINTS = {
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/forgot-password",
        "/api/auth/reset-password"
    };

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        String clientIp = getClientIP(request);
        String requestPath = request.getRequestURI();
        
        Bucket bucket;
        
        // Vérifier si c'est un endpoint d'authentification
        if (isAuthEndpoint(requestPath)) {
            bucket = authBuckets.computeIfAbsent(clientIp, this::createAuthBucket);
        } else {
            bucket = buckets.computeIfAbsent(clientIp, this::createStandardBucket);
        }
        
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit dépassé pour IP: {} sur endpoint: {}", clientIp, requestPath);
            sendRateLimitResponse(response, clientIp);
        }
    }
    
    /**
     * Crée un bucket standard pour les requêtes générales.
     * 100 requêtes par minute.
     */
    private Bucket createStandardBucket(String key) {
        Bandwidth limit = Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
    
    /**
     * Crée un bucket plus restrictif pour les endpoints d'authentification.
     * 5 tentatives par minute pour éviter le brute force.
     */
    private Bucket createAuthBucket(String key) {
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }
    
    /**
     * Vérifie si l'endpoint est un endpoint d'authentification sensible.
     */
    private boolean isAuthEndpoint(String path) {
        for (String authEndpoint : AUTH_ENDPOINTS) {
            if (path.startsWith(authEndpoint)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Récupère l'IP du client (gère les proxies).
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Envoie une réponse d'erreur 429 Too Many Requests.
     */
    private void sendRateLimitResponse(HttpServletResponse response, String clientIp) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", "60");
        
        String jsonResponse = String.format(
            "{\"success\": false, \"message\": \"Trop de requêtes. Veuillez réessayer dans une minute.\", \"timestamp\": \"%s\"}",
            java.time.LocalDateTime.now().toString()
        );
        
        response.getWriter().write(jsonResponse);
    }
    
    /**
     * Nettoie périodiquement les buckets expirés (à appeler via un scheduler).
     */
    public void cleanupExpiredBuckets() {
        // Cette méthode peut être appelée par un @Scheduled pour nettoyer les buckets
        // Pour l'instant, Bucket4j gère efficacement la mémoire
        log.info("Nettoyage des buckets - Standard: {}, Auth: {}", buckets.size(), authBuckets.size());
    }
}
