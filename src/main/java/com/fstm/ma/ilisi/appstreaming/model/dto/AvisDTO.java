package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AvisDTO {
    
    private Long id;
    
    @NotNull
    private Long etudiantId;
    
    @NotNull
    private Long coursId;
    
    private String etudiantNom;
    
    private String etudiantPhoto;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer note;
    
    private String commentaire;
    
    private LocalDateTime dateCreation;
    
    private LocalDateTime dateModification;
}
