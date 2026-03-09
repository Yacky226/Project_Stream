package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class QuestionDTO {
    
    private Long id;
    
    @NotBlank
    private String contenu;
    
    private LocalDateTime timestamp;
    
    private Integer votes;
    
    private Boolean estRepondue;
    
    @NotNull
    private Long auteurId;
    
    private String auteurNom;
    
    private String auteurPhoto;
    
    @NotNull
    private Long sessionId;
    
    private Boolean userHasVoted;
}
