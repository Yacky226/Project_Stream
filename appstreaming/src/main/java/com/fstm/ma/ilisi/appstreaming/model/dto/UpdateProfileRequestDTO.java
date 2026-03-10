package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequestDTO {

    @Size(min = 1, max = 255)
    private String nom;

    @Size(min = 1, max = 255)
    private String prenom;

    @PastOrPresent
    private LocalDate dateNaissance;

    @Size(max = 1024)
    private String photoProfil;
}
