package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.SessionStreamingMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service SessionStreaming")
class SessionStreamingServiceTest {

    private static final String TEACHER_EMAIL = "teacher@test.com";

    @Mock
    private SessionStreamingRepository sessionRepository;

    @Mock
    private CoursRepository coursRepository;

    @Mock
    private EnseignantRepository enseignantRepository;

    @Mock
    private InscriptionRepository inscriptionRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private SessionStreamingMapper sessionMapper;

    @Mock
    private StreamingServiceInterface streamingService;

    private SessionStreamingService sessionStreamingService;

    private Cours cours;
    private Enseignant enseignant;
    private SessionStreaming session;
    private SessionStreamingDTO sessionDTO;

    @BeforeEach
    void setUp() {
        sessionStreamingService = new SessionStreamingService(
                sessionRepository,
                coursRepository,
                enseignantRepository,
                inscriptionRepository,
                etudiantRepository,
                sessionMapper,
                streamingService
        );

        enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setNom("Dupont");
        enseignant.setPrenom("Jean");
        enseignant.setEmail(TEACHER_EMAIL);

        cours = new Cours();
        cours.setId(1L);
        cours.setTitre("Java Avance");
        cours.setDescription("Formation Java avancee");
        cours.setEnseignant(enseignant);

        session = new SessionStreaming();
        session.setId(1L);
        session.setCours(cours);
        session.setEnseignant(enseignant);
        session.setDateHeure(LocalDateTime.now());
        session.setStatus(StreamStatus.CREATED);
        session.setStreamKey("stream_123");
        session.setVideoUrl("livekit://room/stream_123");

        sessionDTO = new SessionStreamingDTO();
        sessionDTO.setId(1L);
        sessionDTO.setCoursId(1L);
        sessionDTO.setEnseignantId(1L);
        sessionDTO.setDateHeure(LocalDateTime.now());
    }

    @Test
    @DisplayName("Creer une session - Success")
    void creerSession_Success() {
        SessionStreaming persistedSession = new SessionStreaming();
        persistedSession.setId(1L);
        persistedSession.setCours(cours);
        persistedSession.setEnseignant(enseignant);
        persistedSession.setDateHeure(session.getDateHeure());
        persistedSession.setStatus(session.getStatus());
        persistedSession.setStreamKey(session.getStreamKey());
        persistedSession.setVideoUrl(session.getVideoUrl());

        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.of(enseignant));
        when(sessionMapper.toEntity(any(), any(), any())).thenReturn(session);
        when(streamingService.createStream(any())).thenReturn(session);
        when(sessionRepository.saveAndFlush(any())).thenReturn(persistedSession);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        SessionStreamingDTO result = sessionStreamingService.creerSession(sessionDTO, TEACHER_EMAIL);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(streamingService).createStream(any());
        verify(sessionRepository).saveAndFlush(any());
        verify(sessionMapper).toDTO(any());
    }

    @Test
    @DisplayName("Creer une session - Cours non trouve")
    void creerSession_CoursNotFound() {
        when(coursRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionStreamingService.creerSession(sessionDTO, TEACHER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cours introuvable");
    }

    @Test
    @DisplayName("Creer une session - Enseignant non trouve")
    void creerSession_EnseignantNotFound() {
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionStreamingService.creerSession(sessionDTO, TEACHER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Enseignant introuvable");
    }

    @Test
    @DisplayName("Demarrer un stream - Success")
    void demarrerStream_Success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(enseignantRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.of(enseignant));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        SessionStreamingDTO result = sessionStreamingService.demarrerStream(1L, TEACHER_EMAIL);

        assertThat(result).isNotNull();
        verify(sessionRepository).save(any());
    }

    @Test
    @DisplayName("Demarrer un stream - Session non trouvee")
    void demarrerStream_SessionNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionStreamingService.demarrerStream(1L, TEACHER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Session introuvable");
    }

    @Test
    @DisplayName("Arreter un stream - Success")
    void arreterStream_Success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(enseignantRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.of(enseignant));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        SessionStreamingDTO result = sessionStreamingService.arreterStream(1L, TEACHER_EMAIL);

        assertThat(result).isNotNull();
        verify(streamingService).endStream("stream_123");
        verify(sessionRepository).save(any());
    }

    @Test
    @DisplayName("Recuperer toutes les sessions")
    void getToutesLesSessions_Success() {
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findAll()).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        List<SessionStreamingDTO> result = sessionStreamingService.getToutesLesSessions();

        assertThat(result).hasSize(1);
        verify(sessionRepository).findAll();
    }

    @Test
    @DisplayName("Recuperer les sessions actives")
    void getSessionsActives_Success() {
        session.setStatus(StreamStatus.LIVE);
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findByStatus(StreamStatus.LIVE)).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        List<SessionStreamingDTO> result = sessionStreamingService.getSessionsActives();

        assertThat(result).hasSize(1);
        verify(sessionRepository).findByStatus(StreamStatus.LIVE);
    }

    @Test
    @DisplayName("Recuperer une session par ID - Success")
    void getSessionParId_Success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        SessionStreamingDTO result = sessionStreamingService.getSessionParId(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Recuperer une session par ID - Non trouvee")
    void getSessionParId_NotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionStreamingService.getSessionParId(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Session introuvable");
    }

    @Test
    @DisplayName("Recuperer les sessions par cours")
    void getSessionsParCours_Success() {
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findByCoursId(1L)).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        List<SessionStreamingDTO> result = sessionStreamingService.getSessionsParCours(1L);

        assertThat(result).hasSize(1);
        verify(sessionRepository).findByCoursId(1L);
    }

    @Test
    @DisplayName("Modifier une session - Success")
    void modifierSession_Success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findByEmail(TEACHER_EMAIL)).thenReturn(Optional.of(enseignant));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        SessionStreamingDTO result = sessionStreamingService.modifierSession(1L, sessionDTO, TEACHER_EMAIL);

        assertThat(result).isNotNull();
        verify(sessionRepository).save(any());
    }
}
