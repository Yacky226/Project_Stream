package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;

public interface SessionStreamingServiceInterface {
    SessionStreamingDTO creerSession(SessionStreamingDTO dto);
    SessionStreamingDTO demarrerStream(Long sessionId);
    SessionStreamingDTO arreterStream(Long sessionId);
    List<SessionStreamingDTO> getToutesLesSessions();
    Page<SessionStreamingDTO> getToutesLesSessionsPaginated(Pageable pageable);
    List<SessionStreamingDTO> getSessionsActives();
    List<SessionStreamingDTO> getSessionsParCours(Long coursId);
    List<SessionStreamingDTO> getSessionsParEnseignant(Long enseignantId);
    List<SessionStreamingDTO> getMesSessionsEnseignant(String emailEnseignant);
    Page<SessionStreamingDTO> getSessionsParCoursPaginated(Long coursId, Pageable pageable);
    SessionStreamingDTO getSessionParId(Long id);
    SessionStreamingDTO modifierSession(Long id, SessionStreamingDTO dto);
    void supprimerSession(Long id);
    String getStreamUrl(Long sessionId);
    void updateRecordingUrl(Long sessionId);
    SessionStreamingDTO joinSession(Long sessionId, Long etudiantId);
    SessionStreamingDTO joinSession(Long sessionId, String emailEtudiant);
}
