package com.fstm.ma.ilisi.appstreaming.security;

import com.fstm.ma.ilisi.appstreaming.security.JwtUtil;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Intercepteur pour sécuriser les connexions WebSocket avec JWT
 * Valide le token lors du handshake initial
 */
@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtChannelInterceptor(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Récupérer le token JWT depuis les headers STOMP
            String authToken = accessor.getFirstNativeHeader("Authorization");
            
            if (authToken != null && authToken.startsWith("Bearer ")) {
                String token = authToken.substring(7);
                
                try {
                    // Extraire et valider le token
                    String email = jwtUtil.extractUsername(token);
                    
                    if (email != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        
                        if (jwtUtil.isTokenValid(token, userDetails)) {
                            // Créer l'authentification
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                                );
                            
                            // Attacher l'authentification au contexte de sécurité
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            
                            // Attacher l'utilisateur à la session WebSocket
                            accessor.setUser(authentication);
                        } else {
                            throw new IllegalArgumentException("Token JWT invalide");
                        }
                    }
                } catch (Exception e) {
                    throw new IllegalArgumentException("Erreur d'authentification WebSocket: " + e.getMessage());
                }
            } else {
                throw new IllegalArgumentException("Token JWT manquant dans la connexion WebSocket");
            }
        }

        return message;
    }
}
