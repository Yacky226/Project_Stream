package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EtudiantDTO extends UtilisateurDTO {

    @NotBlank
    private String niveau;
}
