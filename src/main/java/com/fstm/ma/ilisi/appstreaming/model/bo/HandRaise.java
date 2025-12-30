package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "hand_raise")
public class HandRaise implements Serializable {

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
    @JoinColumn(name = "session_id", nullable = false)
    private SessionStreaming session;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime timestampDemande;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HandRaiseStatus statut = HandRaiseStatus.PENDING;

    @Column
    private LocalDateTime timestampAccorde;

    @Column
    private LocalDateTime timestampFin;

    @Column
    private Integer ordre;

    @PrePersist
    protected void onCreate() {
        if (timestampDemande == null) {
            timestampDemande = LocalDateTime.now();
        }
        if (statut == null) {
            statut = HandRaiseStatus.PENDING;
        }
    }
}
