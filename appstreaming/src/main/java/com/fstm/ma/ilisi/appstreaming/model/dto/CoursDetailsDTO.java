package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CoursDetailsDTO {
    
    private Long id;
    
    private String titre;
    
    private String description;
    
    private String categorie;
    
    private LocalDateTime horaire;
    
    private String imageUrl;
    
    private Integer dureeEstimeeHeures;
    
    private LocalDateTime dateCreation;
    
    private Long enseignantId;
    
    private String enseignantNom;
    
    private String enseignantSpecialite;
    
    private List<SectionDTO> sections;
    
    private Long nombreInscrits;
    
    private Double notemoyenne;
    
    private Long nombreAvis;
    
    private Boolean isInscrit;
}
