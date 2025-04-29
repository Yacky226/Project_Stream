package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;

public interface SessionStreamingServiceInterface {
    SessionStreamingDTO creerSession(SessionStreamingDTO dto);
    List<SessionStreamingDTO> getToutesLesSessions();
    List<SessionStreamingDTO> getSessionsParCours(Long coursId);
    SessionStreamingDTO getSessionParId(Long id);
    SessionStreamingDTO modifierSession(Long id, SessionStreamingDTO dto);
    void supprimerSession(Long id);
}
