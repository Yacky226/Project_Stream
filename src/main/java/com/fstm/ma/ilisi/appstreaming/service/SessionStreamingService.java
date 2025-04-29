package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.SessionStreamingMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;

@Service
public class SessionStreamingService implements SessionStreamingServiceInterface {

    private final SessionStreamingRepository sessionRepository;
    private final CoursRepository coursRepository;
    private final SessionStreamingMapper sessionMapper;

    public SessionStreamingService(
            SessionStreamingRepository sessionRepository,
            CoursRepository coursRepository,
            SessionStreamingMapper sessionMapper) {
        this.sessionRepository = sessionRepository;
        this.coursRepository = coursRepository;
        this.sessionMapper = sessionMapper;
    }

    @Override
    public SessionStreamingDTO creerSession(SessionStreamingDTO dto) {
        Cours cours = coursRepository.findById(dto.getCoursId())
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        SessionStreaming session = sessionMapper.toEntity(dto, cours);
        return sessionMapper.toDTO(sessionRepository.save(session));
    }

    @Override
    public List<SessionStreamingDTO> getToutesLesSessions() {
        return sessionRepository.findAll()
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionStreamingDTO> getSessionsParCours(Long coursId) {
        return sessionRepository.findByCoursId(coursId)
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SessionStreamingDTO getSessionParId(Long id) {
        SessionStreaming session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session introuvable"));
        return sessionMapper.toDTO(session);
    }

    @Override
    public SessionStreamingDTO modifierSession(Long id, SessionStreamingDTO dto) {
        SessionStreaming session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session introuvable"));

        Cours cours = coursRepository.findById(dto.getCoursId())
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        session.setDateHeure(dto.getDateHeure());
        session.setEstEnDirect(dto.isEstEnDirect());
        session.setVideoUrl(dto.getVideoUrl());
        session.setCours(cours);

        return sessionMapper.toDTO(sessionRepository.save(session));
    }

    @Override
    public void supprimerSession(Long id) {
        sessionRepository.deleteById(id);
    }
}
