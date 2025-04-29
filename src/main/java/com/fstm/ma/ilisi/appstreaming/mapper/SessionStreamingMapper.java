package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;

@Component
public class SessionStreamingMapper {

    public SessionStreamingDTO toDTO(SessionStreaming session) {
        SessionStreamingDTO dto = new SessionStreamingDTO();
        dto.setId(session.getId());
        dto.setDateHeure(session.getDateHeure());
        dto.setEstEnDirect(session.isEstEnDirect());
        dto.setVideoUrl(session.getVideoUrl());
        dto.setCoursId(session.getCours().getId());
        return dto;
    }

    public SessionStreaming toEntity(SessionStreamingDTO dto, Cours cours) {
        SessionStreaming session = new SessionStreaming();
        session.setId(dto.getId());
        session.setDateHeure(dto.getDateHeure());
        session.setEstEnDirect(dto.isEstEnDirect());
        session.setVideoUrl(dto.getVideoUrl());
        session.setCours(cours);
        return session;
    }
}
