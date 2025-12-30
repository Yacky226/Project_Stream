package com.fstm.ma.ilisi.appstreaming.config;

import com.fstm.ma.ilisi.appstreaming.security.JwtChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtChannelInterceptor jwtChannelInterceptor;

    public WebSocketConfig(JwtChannelInterceptor jwtChannelInterceptor) {
        this.jwtChannelInterceptor = jwtChannelInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Toutes les destinations envoyées vers /topic/... seront broadcastées
        config.enableSimpleBroker("/topic");
        
        // Les messages envoyés depuis le client avec destination /app/... seront dirigés vers un @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-stream")
                .setAllowedOriginPatterns("*") // autorise tout domaine pour test/dev
                .withSockJS(); // fallback vers SockJS pour compatibilité
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Ajouter l'intercepteur JWT pour sécuriser les connexions WebSocket
        registration.interceptors(jwtChannelInterceptor);
    }
}
