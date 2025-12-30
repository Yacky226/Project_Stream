package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"etudiant_id", "cours_id"}))
public class Inscription implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cours_id", nullable = false)
    private Cours cours;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateInscription;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutInscription statut;

    @Min(0)
    @Max(100)
    @Column(nullable = false)
    private Double progression = 0.0;

    private LocalDateTime dateCompletion;

    @OneToMany(mappedBy = "inscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProgressionLecon> progressionLecons = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (dateInscription == null) {
            dateInscription = LocalDateTime.now();
        }
        if (statut == null) {
            statut = StatutInscription.ACTIF;
        }
        if (progression == null) {
            progression = 0.0;
        }
    }
}
