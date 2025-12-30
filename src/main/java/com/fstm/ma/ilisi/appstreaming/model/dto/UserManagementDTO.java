package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDTO {
    
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role; // ETUDIANT, ENSEIGNANT, ADMINISTRATEUR
    private boolean actif;
    private LocalDateTime dateCreation;
    
    // Statistiques spécifiques
    private Integer nombreCours; // Pour enseignant: cours créés, Pour étudiant: cours inscrits
    private Integer nombreInscriptions; // Pour étudiant uniquement
    private Integer nombreSessions; // Pour enseignant uniquement
    
    // Informations supplémentaires
    private String specialite; // Pour enseignant
    private String niveau; // Pour étudiant
    private String photoProfil;
}
