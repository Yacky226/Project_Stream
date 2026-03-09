package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse d'authentification contenant les tokens.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn; // durée de validité en secondes
    private String email;
    private String role;
    private Long userId;
    
    public static AuthResponse of(String accessToken, String refreshToken, long expiresIn, 
                                   String email, String role, Long userId) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .email(email)
                .role(role)
                .userId(userId)
                .build();
    }
}
