package com.fstm.ma.ilisi.appstreaming.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * Filtre pour ajouter un ID de trace unique à chaque requête.
 * Permet de suivre les logs d'une même requête à travers tout le système.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestTracingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestTracingFilter.class);
    private static final Set<String> NOISY_LOCAL_PROBE_PATHS = Set.of(
            "/v2/message-subscriptions/search",
            "/v2/process-definitions/search");
    
    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String MDC_TRACE_ID = "traceId";
    public static final String MDC_CLIENT_IP = "clientIp";
    public static final String MDC_USER = "user";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return NOISY_LOCAL_PROBE_PATHS.contains(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        // Générer ou récupérer le trace ID
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isEmpty()) {
            traceId = generateTraceId();
        }
        
        // Récupérer l'IP du client
        String clientIp = getClientIP(request);
        
        // Ajouter au MDC pour les logs
        MDC.put(MDC_TRACE_ID, traceId);
        MDC.put(MDC_CLIENT_IP, clientIp);
        
        // Ajouter le trace ID à la réponse
        response.setHeader(TRACE_ID_HEADER, traceId);
        
        try {
            // Log de début de requête
            log.info(">>> Requête entrante: {} {} depuis {}", 
                request.getMethod(), 
                request.getRequestURI(),
                clientIp
            );
            
            filterChain.doFilter(request, response);
            
        } finally {
            // Log de fin de requête avec durée
            long duration = System.currentTimeMillis() - startTime;
            log.info("<<< Requête terminée: {} {} - Status: {} - Durée: {}ms",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                duration
            );
            
            // Nettoyer le MDC
            MDC.clear();
        }
    }
    
    /**
     * Génère un ID de trace court et unique.
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * Récupère l'IP réelle du client (gère les proxies).
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
}
