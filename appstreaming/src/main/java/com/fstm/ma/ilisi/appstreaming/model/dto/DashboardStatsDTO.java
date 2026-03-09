package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Statistiques globales
    private Long totalUtilisateurs;
    private Long totalEtudiants;
    private Long totalEnseignants;
    private Long totalAdministrateurs;
    
    private Long totalCours;
    private Long coursActifs;
    private Long coursArchives;
    
    private Long totalInscriptions;
    private Long inscriptionsActives;
    
    private Long totalSections;
    private Long totalLecons;
    
    // Sessions de streaming
    private Long totalSessions;
    private Long sessionsLive;
    private Long sessionsTerminees;
    
    // Interactivité
    private Long totalMessages;
    private Long totalQuestions;
    private Long totalHandRaises;
    
    // Statistiques par période (dernier mois)
    private Long nouvellesInscriptionsMois;
    private Long nouveauxUtilisateursMois;
    private Long sessionsLiveMois;
    
    // Moyennes
    private Double moyenneNoteCours;
    private Double tauxCompletionMoyen;
    
    // Top éléments
    private Map<String, Object> coursLesPlusPopulaires; // Top 5
    private Map<String, Object> enseignantsLesPlusActifs; // Top 5
}
