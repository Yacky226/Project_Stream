package com.fstm.ma.ilisi.appstreaming.model.dto;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UtilisateurDTO {

	@NotNull
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    @JsonIgnore
    private String password;

    @NotBlank
    @Email
    private String email;

    @NotNull
    private String role; 
}
