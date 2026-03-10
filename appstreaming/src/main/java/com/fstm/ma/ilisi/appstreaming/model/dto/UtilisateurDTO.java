package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String prenom;

    @NotBlank
    @JsonView
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private String role;

    @PastOrPresent // La date de naissance doit être dans le passé ou aujourd'hui
    @JsonFormat(pattern = "yyyy-MM-dd") // Format pour la sérialisation JSON
    private LocalDate dateNaissance;

    private String photoProfil; // Chemin ou URL de la photo
}
