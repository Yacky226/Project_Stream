package com.fstm.ma.ilisi.appstreaming.model.dto;

import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

import org.hibernate.sql.Update;

@Data
public class SessionStreamingDTO {
	
	@NotNull(groups = Update.class)
	private Long id;


    @NotNull
    private LocalDateTime dateHeure;

    private boolean estEnDirect;

    private String videoUrl;

    @NotNull
    private Long coursId;

    @NotNull
    private Long enseignantId;

    private String streamKey;
    private String recordingUrl;
    private boolean recordingEnabled = true;
    private StreamStatus status;
    private String resolution;
    private String broadcastType;

    // Méthodes utilitaires
    public boolean isLive() {
        return StreamStatus.LIVE.equals(status);
    }
}