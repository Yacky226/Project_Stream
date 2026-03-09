package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonView;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UtilisateurDTO {

    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    @JsonView
    private String password;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private String role;

    @PastOrPresent // La date de naissance doit être dans le passé ou aujourd'hui
    @JsonFormat(pattern = "dd/MM/yyyy") // Format pour la sérialisation JSON
    private LocalDate dateNaissance;

    private String photoProfil; // Chemin ou URL de la photo
}