package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;

public interface SessionStreamingServiceInterface {
    SessionStreamingDTO creerSession(SessionStreamingDTO dto);
    SessionStreamingDTO demarrerStream(Long sessionId);
    SessionStreamingDTO arreterStream(Long sessionId);
    List<SessionStreamingDTO> getToutesLesSessions();
    List<SessionStreamingDTO> getSessionsActives();
    List<SessionStreamingDTO> getSessionsParCours(Long coursId);
    SessionStreamingDTO getSessionParId(Long id);
    SessionStreamingDTO modifierSession(Long id, SessionStreamingDTO dto);
    void supprimerSession(Long id);
    String getStreamUrl(Long sessionId);
    void updateRecordingUrl(Long sessionId); // Récupération manuelle du VOD
    SessionStreamingDTO joinSession(Long sessionId, Long etudiantId); // Vérification d'accès
}