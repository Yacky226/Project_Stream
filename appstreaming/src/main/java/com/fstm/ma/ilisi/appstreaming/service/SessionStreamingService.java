package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.exception.EnrollmentRequiredException;
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

    private static final Logger log = LoggerFactory.getLogger(SessionStreamingService.class);
    private static final int VOD_FETCH_MAX_ATTEMPTS = 4;
    private static final long VOD_FETCH_RETRY_DELAY_MS = 3000L;

    private final SessionStreamingRepository sessionRepository;
    private final CoursRepository coursRepository;
    private final EnseignantRepository enseignantRepository;
    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final SessionStreamingMapper sessionMapper;
    private final StreamingServiceInterface streamingService;

    public SessionStreamingService(
            SessionStreamingRepository sessionRepository,
            CoursRepository coursRepository,
            EnseignantRepository enseignantRepository,
            InscriptionRepository inscriptionRepository,
            EtudiantRepository etudiantRepository,
            SessionStreamingMapper sessionMapper,
            StreamingServiceInterface streamingService) {
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
        // Creation endpoint must always create a new DB row.
        session.setId(null);
        session.setStatus(StreamStatus.CREATED);

        SessionStreaming createdSession = streamingService.createStream(session);
        SessionStreaming savedSession = sessionRepository.saveAndFlush(createdSession);

        if (savedSession.getId() == null) {
            throw new IllegalStateException("La session n'a pas ete persistée correctement (ID nul)");
        }

        log.info("Session streaming creee: id={}, coursId={}, enseignantId={}, streamKey={}",
                savedSession.getId(),
                savedSession.getCours() != null ? savedSession.getCours().getId() : null,
                savedSession.getEnseignant() != null ? savedSession.getEnseignant().getId() : null,
                savedSession.getStreamKey());

        return sessionMapper.toDTO(savedSession);
    }

    @Override
    public SessionStreamingDTO demarrerStream(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        session.startStream();
        sessionRepository.save(session);

        return sessionMapper.toDTO(session);
    }

    @Override
    public SessionStreamingDTO arreterStream(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        streamingService.endStream(session.getStreamKey());
        session.endStream();
        SessionStreaming saved = sessionRepository.save(session);

        // En fin de live, tentative automatique de lier le replay pour visionnage futur.
        tryAttachVod(saved, VOD_FETCH_MAX_ATTEMPTS, VOD_FETCH_RETRY_DELAY_MS);

        return sessionMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStreamingDTO> getToutesLesSessions() {
        return sessionRepository.findAll()
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SessionStreamingDTO> getToutesLesSessionsPaginated(Pageable pageable) {
        return sessionRepository.findAll(pageable)
                .map(sessionMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStreamingDTO> getSessionsActives() {
        return sessionRepository.findByStatus(StreamStatus.LIVE)
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStreamingDTO> getSessionsParCours(Long coursId) {
        return sessionRepository.findByCoursId(coursId)
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStreamingDTO> getSessionsParEnseignant(Long enseignantId) {
        return sessionRepository.findByEnseignantId(enseignantId)
                .stream()
                .map(sessionMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionStreamingDTO> getMesSessionsEnseignant(String emailEnseignant) {
        Enseignant enseignant = enseignantRepository.findByEmail(emailEnseignant)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant introuvable"));
        return getSessionsParEnseignant(enseignant.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SessionStreamingDTO> getSessionsParCoursPaginated(Long coursId, Pageable pageable) {
        return sessionRepository.findByCoursId(coursId, pageable)
                .map(sessionMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public String getStreamUrl(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        if (session.isLive()) {
            return session.getVideoUrl();
        }
        if (session.getRecordingUrl() != null) {
            return session.getRecordingUrl();
        }

        throw new IllegalStateException("Aucun stream disponible pour cette session");
    }

    @Override
    public void updateRecordingUrl(Long sessionId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        if (session.getStatus() != StreamStatus.ENDED) {
            throw new IllegalStateException("Le stream doit etre termine pour recuperer le VOD");
        }

        boolean attached = tryAttachVod(session, 1, 0);
        if (attached) {
            return;
        }

        throw new IllegalStateException("VOD pas encore disponible sur Ant Media");
    }

    private boolean tryAttachVod(SessionStreaming session, int maxAttempts, long retryDelayMs) {
        if (!session.isRecordingEnabled()) {
            log.info("Enregistrement desactive pour la session {}", session.getId());
            return false;
        }
        if (session.getStreamKey() == null || session.getStreamKey().isBlank()) {
            log.warn("Impossible de recuperer le VOD: streamKey absent pour session {}", session.getId());
            return false;
        }

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            String vodUrl = streamingService.getVodUrl(session.getStreamKey());
            if (vodUrl != null && !vodUrl.isBlank()) {
                session.setRecordingUrl(vodUrl);
                sessionRepository.save(session);
                log.info("Replay sauvegarde pour session {}: {}", session.getId(), vodUrl);
                return true;
            }

            if (attempt < maxAttempts && retryDelayMs > 0) {
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    log.warn("Interruption lors de la tentative de recuperation VOD pour session {}", session.getId());
                    return false;
                }
            }
        }

        log.warn("VOD indisponible apres {} tentative(s) pour session {}", maxAttempts, session.getId());
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public SessionStreamingDTO joinSession(Long sessionId, Long etudiantId) {
        SessionStreaming session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session introuvable"));

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable"));

        Inscription inscription = inscriptionRepository
                .findByEtudiantAndCours(etudiant, session.getCours())
                .orElseThrow(() -> new EnrollmentRequiredException(
                        "Vous devez etre inscrit au cours pour acceder a cette session"));

        if (inscription.getStatut() != StatutInscription.ACTIF) {
            throw new EnrollmentRequiredException("Votre inscription n'est pas active");
        }

        return sessionMapper.toDTO(session);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionStreamingDTO joinSession(Long sessionId, String emailEtudiant) {
        Etudiant etudiant = etudiantRepository.findByEmail(emailEtudiant)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant introuvable"));
        return joinSession(sessionId, etudiant.getId());
    }
}
