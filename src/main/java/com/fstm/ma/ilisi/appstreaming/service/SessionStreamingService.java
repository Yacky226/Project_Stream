package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.SessionStreamingMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;

@Service
@Transactional
public class SessionStreamingService implements SessionStreamingServiceInterface {

    private final SessionStreamingRepository sessionRepository;
    private final CoursRepository coursRepository;
    private final EnseignantRepository enseignantRepository;
    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final SessionStreamingMapper sessionMapper;
    private final StreamingService streamingService;

    public SessionStreamingService(
            SessionStreamingRepository sessionRepository,
            CoursRepository coursRepository,
            EnseignantRepository enseignantRepository,
            InscriptionRepository inscriptionRepository,
            EtudiantRepository etudiantRepository,
            SessionStreamingMapper sessionMapper,
            StreamingService streamingService) {
        this.sessionRepository = sessionRepository;
        this.coursRepository = coursRepository;
        this.enseignantRepository = enseignantRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.etudiantRepository = etudiantRepository;
        this.sessionMapper = sessionMapper;
        this.streamingService = streamingService;
    }

    @Override
    public SessionStreamingDTO creerSession(SessionStreamingDTO dto) {
        Cours cours = coursRepository.findById(dto.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable"));
        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable"));

        SessionStreaming session = sessionMapper.toEntity(dto, cours, enseignant);
        session.setStatus(StreamStatus.CREATED);
        
        // Créer le stream dans Ant Media Server
        SessionStreaming savedSession = streamingService.createStream(session);
        
        return sessionMapper.toDTO(savedSession);
    }

    @Override
    public SessionStreamingDTO demarrerStream(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));
        
        session.startStream(); // Met à jour le statut et la date
        sessionRepository.save(session);
        
        // Envoyer notification aux étudiants
        // notificationService.notifyNewStream(session);
        
        return sessionMapper.toDTO(session);
    }

    @Override
    public SessionStreamingDTO arreterStream(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));
        
        streamingService.endStream(session.getStreamKey());
        session.endStream();
        sessionRepository.save(session);
        
        return sessionMapper.toDTO(session);
    }

    @Override
    public List<SessionStreamingDTO> getToutesLesSessions() {
        return sessionRepository.findAll()
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<SessionStreamingDTO> getSessionsActives() {
        return sessionRepository.findByStatus(StreamStatus.LIVE)
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
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));
        return sessionMapper.toDTO(session);
    }

    @Override
    public SessionStreamingDTO modifierSession(Long id, SessionStreamingDTO dto) {
        SessionStreaming session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        Cours cours = coursRepository.findById(dto.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable"));

        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable"));

        session.setDateHeure(dto.getDateHeure());
        session.setEstEnDirect(dto.isEstEnDirect());
        session.setVideoUrl(dto.getVideoUrl());
        session.setRecordingEnabled(dto.isRecordingEnabled());
        session.setResolution(dto.getResolution());
        session.setBroadcastType(dto.getBroadcastType());
        session.setCours(cours);
        session.setEnseignant(enseignant);

        return sessionMapper.toDTO(sessionRepository.save(session));
    }

    @Override
    public void supprimerSession(Long id) {
        SessionStreaming session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));
        
        if (session.isLive()) {
            streamingService.endStream(session.getStreamKey());
        }
        
        sessionRepository.delete(session);
    }

    @Override
    public String getStreamUrl(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));
        
        if (session.isLive()) {
            return session.getVideoUrl();
        } else if (session.getRecordingUrl() != null) {
            return session.getRecordingUrl();
        }
        throw new IllegalStateException("Aucun stream disponible pour cette session");
    }

    @Override
    public void updateRecordingUrl(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        if (session.getStatus() != StreamStatus.ENDED) {
            throw new IllegalStateException("Le stream doit être terminé pour récupérer le VOD");
        }

        String vodUrl = streamingService.getVodUrl(session.getStreamKey());
        if (vodUrl != null) {
            session.setRecordingUrl(vodUrl);
            sessionRepository.save(session);
        } else {
            throw new IllegalStateException("VOD pas encore disponible sur Ant Media");
        }
    }

    @Override
    public SessionStreamingDTO joinSession(Long sessionId, Long etudiantId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant introuvable"));

        // Vérification stricte : l'étudiant doit être inscrit au cours
        Inscription inscription = inscriptionRepository
                .findByEtudiantAndCours(etudiant, session.getCours())
                .orElseThrow(() -> new IllegalStateException(
                        "Vous devez être inscrit au cours pour accéder à cette session"));

        // Vérifier que l'inscription est active
        if (inscription.getStatut() != StatutInscription.ACTIF) {
            throw new IllegalStateException("Votre inscription n'est pas active");
        }

        return sessionMapper.toDTO(session);
    }
}