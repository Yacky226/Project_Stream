package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InscriptionDTO {
    
    private Long id;
    
    @NotNull
    private Long etudiantId;
    
    @NotNull
    private Long coursId;
    
    private String etudiantNom;
    
    private String coursTitre;
    
    private LocalDateTime dateInscription;
    
    private StatutInscription statut;
    
    @Min(0)
    @Max(100)
    private Double progression;
    
    private LocalDateTime dateCompletion;
}
