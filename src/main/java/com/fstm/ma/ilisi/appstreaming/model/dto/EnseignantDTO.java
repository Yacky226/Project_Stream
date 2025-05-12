package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnseignantDTO extends UtilisateurDTO {

    @NotBlank
    private String specialite;
    
    private List<Long> coursIds;
}
