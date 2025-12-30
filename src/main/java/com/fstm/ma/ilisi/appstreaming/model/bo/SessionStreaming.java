package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class SessionStreaming implements Serializable {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime dateHeure;

    @Column(nullable = false)
    private boolean estEnDirect;

    @NotBlank
    @Column(nullable = false)
    private String videoUrl; // URL de lecture HLS

    @NotNull
    @ManyToOne
    @JoinColumn(nullable = false)
    private Cours cours;

    @NotNull
    @ManyToOne
    @JoinColumn(nullable = false)
    private Enseignant enseignant;

    @Column(unique = true)
    private String streamKey; // Clé RTMP pour OBS/Ant Media

    @Column
    private String recordingUrl; // URL du replay après stream

    @Column
    private boolean isRecordingEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StreamStatus status = StreamStatus.CREATED;

    @Column
    private String resolution; // Résolution vidéo

    @Column
    private String broadcastType; // "RTMP", "WebRTC"

    // Méthodes utilitaires
    public boolean isLive() {
        return status == StreamStatus.LIVE;
    }

    public void startStream() {
        this.status = StreamStatus.LIVE;
        this.estEnDirect = true;
        this.dateHeure = LocalDateTime.now();
    }

    public void endStream() {
        this.status = StreamStatus.ENDED;
        this.estEnDirect = false;
    }
}