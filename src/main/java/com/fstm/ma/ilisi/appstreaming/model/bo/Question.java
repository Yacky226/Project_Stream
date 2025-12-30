package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "question")
public class Question implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 2000)
    private String contenu;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Integer votes = 0;

    @Column(nullable = false)
    private Boolean estRepondue = false;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "auteur_id", nullable = false)
    private Utilisateur auteur;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private SessionStreaming session;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Vote> votesUtilisateurs = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (votes == null) {
            votes = 0;
        }
        if (estRepondue == null) {
            estRepondue = false;
        }
    }
}
