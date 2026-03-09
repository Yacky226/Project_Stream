package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;

@Entity
@Data
public class Ressource implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRessource type;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String url;

    @Column
    private Long tailleFichier;

    @ManyToOne
    @JoinColumn(name = "lecon_id")
    private Lecon lecon;

    @ManyToOne
    @JoinColumn(name = "cours_id")
    private Cours cours;
}
