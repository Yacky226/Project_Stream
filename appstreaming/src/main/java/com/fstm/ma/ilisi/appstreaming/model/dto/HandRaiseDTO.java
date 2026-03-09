package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.HandRaiseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HandRaiseDTO {
    
    private Long id;
    
    @NotNull
    private Long etudiantId;
    
    private String etudiantNom;
    
    private String etudiantPhoto;
    
    @NotNull
    private Long sessionId;
    
    private LocalDateTime timestampDemande;
    
    private HandRaiseStatus statut;
    
    private LocalDateTime timestampAccorde;
    
    private LocalDateTime timestampFin;
    
    private Integer ordre;
}
