package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Data
public abstract class Utilisateur implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nom;

    @NotBlank
    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String prenom;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean actif = true;

    @Column(nullable = false, columnDefinition = "timestamp default current_timestamp")
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PastOrPresent 
    @Column(nullable = true) 
    private LocalDate dateNaissance;

    @Column(nullable = true) 
    private String photoProfil;

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) {
            dateCreation = LocalDateTime.now();
        }
    } 
}