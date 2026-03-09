package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.TypeRessource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RessourceDTO {
    
    private Long id;
    
    @NotBlank
    private String titre;
    
    @NotNull
    private TypeRessource type;
    
    @NotBlank
    private String url;
    
    private Long tailleFichier;
    
    private Long leconId;
    
    private Long coursId;
}
