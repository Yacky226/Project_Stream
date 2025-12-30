package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CoursDTO {


    private Long id;

    @NotBlank
    private String titre;

    @NotBlank
    private String description;

    @NotBlank
    private String categorie;

    @NotNull
    private LocalDateTime horaire;

    @NotNull
    private Long enseignantId;
}
