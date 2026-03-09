package com.fstm.ma.ilisi.appstreaming.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filtre de sécurité pour les webhooks Ant Media Server
 * Valide soit un secret partagé, soit une whitelist d'IPs
 */
@Component
public class WebhookSecurityFilter extends OncePerRequestFilter {

    @Value("${antmedia.webhook.secret:}")
    private String webhookSecret;

    @Value("${antmedia.webhook.allowed-ips:}")
    private String allowedIpsConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Appliquer la sécurité uniquement sur l'endpoint webhook
        if (requestPath.startsWith("/api/webhook/antmedia")) {
            
            boolean isAuthorized = false;
            
            // Méthode 1: Validation par secret partagé (header)
            if (webhookSecret != null && !webhookSecret.isEmpty()) {
                String providedSecret = request.getHeader("X-Webhook-Secret");
                if (webhookSecret.equals(providedSecret)) {
                    isAuthorized = true;
                }
            }
            
            // Méthode 2: Validation par whitelist IP
            if (!isAuthorized && allowedIpsConfig != null && !allowedIpsConfig.isEmpty()) {
                String clientIp = getClientIp(request);
                List<String> allowedIps = Arrays.asList(allowedIpsConfig.split(","));
                
                if (allowedIps.contains(clientIp.trim())) {
                    isAuthorized = true;
                }
            }
            
            // Si aucune méthode de sécurité configurée, autoriser (mode dev)
            if (webhookSecret.isEmpty() && allowedIpsConfig.isEmpty()) {
                logger.warn("⚠️ Webhook non sécurisé ! Configurez antmedia.webhook.secret ou antmedia.webhook.allowed-ips");
                isAuthorized = true;
            }
            
            // Bloquer si non autorisé
            if (!isAuthorized) {
                logger.warn("🚫 Tentative d'accès webhook non autorisée depuis: " + getClientIp(request));
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\": \"Accès refusé au webhook\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }

    /**
     * Obtenir l'adresse IP réelle du client (même derrière un proxy)
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
