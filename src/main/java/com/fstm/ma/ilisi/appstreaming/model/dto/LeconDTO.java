package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.TypeLecon;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class LeconDTO {
    
    private Long id;
    
    @NotBlank
    private String titre;
    
    private String description;
    
    @NotNull
    private TypeLecon type;
    
    private String contenuUrl;
    
    private String contenuTexte;
    
    private Integer dureeMinutes;
    
    @NotNull
    private Integer ordre;
    
    @NotNull
    private Long sectionId;
    
    private List<RessourceDTO> ressources;
    
    private Boolean isCompleted;
}
