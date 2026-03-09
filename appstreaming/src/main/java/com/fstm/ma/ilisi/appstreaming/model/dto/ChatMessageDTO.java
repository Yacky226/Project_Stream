package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageDTO {
    
    private Long id;
    
    @NotBlank
    private String contenu;
    
    private LocalDateTime timestamp;
    
    @NotNull
    private Long expediteurId;
    
    private String expediteurNom;
    
    private String expediteurPhoto;
    
    private String expediteurRole;
    
    @NotNull
    private Long sessionId;
}
