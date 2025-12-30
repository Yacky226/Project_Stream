package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class EtudiantDTO extends UtilisateurDTO {

    @NotBlank
    private String niveau;
}
