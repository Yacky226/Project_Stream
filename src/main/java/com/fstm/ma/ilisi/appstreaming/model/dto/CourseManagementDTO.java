package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseManagementDTO {
    
    private Long id;
    private String titre;
    private String description;
    private boolean archive;
    private LocalDateTime dateCreation;
    
    // Enseignant
    private Long enseignantId;
    private String enseignantNom;
    private String enseignantPrenom;
    
    // Statistiques
    private Integer nombreInscriptions;
    private Integer nombreSections;
    private Integer nombreLecons;
    private Integer nombreSessions;
    private Double moyenneNotes;
    private Integer nombreAvis;
    
    // Popularité
    private Integer vuesTotal;
    private Double tauxCompletion;
}
