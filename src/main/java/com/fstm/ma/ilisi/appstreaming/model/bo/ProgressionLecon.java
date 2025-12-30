package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
public class ProgressionLecon implements Serializable {

    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private ProgressionLeconId id;

    @ManyToOne
    @MapsId("inscriptionId")
    @JoinColumn(name = "inscription_id", nullable = false)
    private Inscription inscription;

    @ManyToOne
    @JoinColumn(name = "lecon_id", nullable = false, insertable = false, updatable = false)
    private Lecon lecon;

    @NotNull
    @Column(nullable = false)
    private Boolean termine = false;

    @Column
    private LocalDateTime dateCompletion;

    @PrePersist
    protected void onCreate() {
        if (termine == null) {
            termine = false;
        }
    }
}
