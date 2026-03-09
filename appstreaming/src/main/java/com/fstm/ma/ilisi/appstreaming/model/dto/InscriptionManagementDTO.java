package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InscriptionManagementDTO {
    
    private Long id;
    
    // Étudiant
    private Long etudiantId;
    private String etudiantNom;
    private String etudiantPrenom;
    private String etudiantEmail;
    
    // Cours
    private Long coursId;
    private String coursTitre;
    
    // Enseignant du cours
    private String enseignantNom;
    
    // Progression
    private StatutInscription statut;
    private Double progression;
    private LocalDateTime dateInscription;
    private LocalDateTime dateDerniereActivite;
    
    // Statistiques
    private Integer leconsCompletees;
    private Integer leconsTotal;
}
