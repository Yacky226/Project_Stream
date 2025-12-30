package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;

@Component
public class SessionStreamingMapper {

    public SessionStreamingDTO toDTO(SessionStreaming session) {
        if (session == null) {
            return null;
        }

        SessionStreamingDTO dto = new SessionStreamingDTO();
        dto.setId(session.getId());
        dto.setDateHeure(session.getDateHeure());
        dto.setEstEnDirect(session.isEstEnDirect());
        dto.setVideoUrl(session.getVideoUrl());
        dto.setStreamKey(session.getStreamKey());
        dto.setRecordingUrl(session.getRecordingUrl());
        dto.setRecordingEnabled(session.isRecordingEnabled());
        dto.setStatus(session.getStatus());
        dto.setResolution(session.getResolution());
        dto.setBroadcastType(session.getBroadcastType());
        
        // Gestion des relations
        if (session.getCours() != null) {
            dto.setCoursId(session.getCours().getId());
        }
        if (session.getEnseignant() != null) {
            dto.setEnseignantId(session.getEnseignant().getId());
        }
        
        return dto;
    }

    public SessionStreaming toEntity(SessionStreamingDTO dto, Cours cours, Enseignant enseignant) {
        if (dto == null) {
            return null;
        }

        SessionStreaming session = new SessionStreaming();
        session.setId(dto.getId());
        session.setDateHeure(dto.getDateHeure());
        session.setEstEnDirect(dto.isEstEnDirect());
        session.setVideoUrl(dto.getVideoUrl());
        session.setStreamKey(dto.getStreamKey());
        session.setRecordingUrl(dto.getRecordingUrl());
        session.setRecordingEnabled(dto.isRecordingEnabled());
        session.setStatus(dto.getStatus() != null ? dto.getStatus() : StreamStatus.CREATED);
        session.setResolution(dto.getResolution());
        session.setBroadcastType(dto.getBroadcastType());
        
        // Gestion des relations
        session.setCours(cours);
        session.setEnseignant(enseignant);
        
        return session;
    }
}