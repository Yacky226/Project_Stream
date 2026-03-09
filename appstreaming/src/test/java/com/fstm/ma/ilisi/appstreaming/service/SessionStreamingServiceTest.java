package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.SessionStreamingMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.repository.*;
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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service SessionStreaming")
class SessionStreamingServiceTest {

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
        // Initialiser le service manuellement
        sessionStreamingService = new SessionStreamingService(
            sessionRepository,
            coursRepository,
            enseignantRepository,
            inscriptionRepository,
            etudiantRepository,
            sessionMapper,
            streamingService
        );
        
        // Initialiser les objets de test
        enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setNom("Dupont");
        enseignant.setPrenom("Jean");
        enseignant.setEmail("jean.dupont@test.com");

        cours = new Cours();
        cours.setId(1L);
        cours.setTitre("Java Avancé");
        cours.setDescription("Formation Java avancée");
        cours.setEnseignant(enseignant);

        session = new SessionStreaming();
        session.setId(1L);
        session.setCours(cours);
        session.setEnseignant(enseignant);
        session.setDateHeure(LocalDateTime.now());
        session.setStatus(StreamStatus.CREATED);
        session.setStreamKey("stream_123");
        session.setVideoUrl("http://localhost:5080/LiveApp/streams/stream_123.m3u8");

        sessionDTO = new SessionStreamingDTO();
        sessionDTO.setId(1L);
        sessionDTO.setCoursId(1L);
        sessionDTO.setEnseignantId(1L);
        sessionDTO.setDateHeure(LocalDateTime.now());
    }

    @Test
    @DisplayName("Créer une session - Succès")
    void creerSession_Success() {
        // Given
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findById(1L)).thenReturn(Optional.of(enseignant));
        when(sessionMapper.toEntity(any(), any(), any())).thenReturn(session);
        when(streamingService.createStream(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        SessionStreamingDTO result = sessionStreamingService.creerSession(sessionDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(streamingService).createStream(any());
        verify(sessionMapper).toDTO(any());
    }

    @Test
    @DisplayName("Créer une session - Cours non trouvé")
    void creerSession_CoursNotFound() {
        // Given
        when(coursRepository.findById(1L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> sessionStreamingService.creerSession(sessionDTO))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Cours introuvable");
    }

    @Test
    @DisplayName("Créer une session - Enseignant non trouvé")
    void creerSession_EnseignantNotFound() {
        // Given
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findById(1L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> sessionStreamingService.creerSession(sessionDTO))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Enseignant introuvable");
    }

    @Test
    @DisplayName("Démarrer un stream - Succès")
    void demarrerStream_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        SessionStreamingDTO result = sessionStreamingService.demarrerStream(1L);

        // Then
        assertThat(result).isNotNull();
        verify(sessionRepository).save(any());
    }

    @Test
    @DisplayName("Démarrer un stream - Session non trouvée")
    void demarrerStream_SessionNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> sessionStreamingService.demarrerStream(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Session introuvable");
    }

    @Test
    @DisplayName("Arrêter un stream - Succès")
    void arreterStream_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        SessionStreamingDTO result = sessionStreamingService.arreterStream(1L);

        // Then
        assertThat(result).isNotNull();
        verify(streamingService).endStream("stream_123");
        verify(sessionRepository).save(any());
    }

    @Test
    @DisplayName("Récupérer toutes les sessions")
    void getToutesLesSessions_Success() {
        // Given
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findAll()).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        List<SessionStreamingDTO> result = sessionStreamingService.getToutesLesSessions();

        // Then
        assertThat(result).hasSize(1);
        verify(sessionRepository).findAll();
    }

    @Test
    @DisplayName("Récupérer les sessions actives")
    void getSessionsActives_Success() {
        // Given
        session.setStatus(StreamStatus.LIVE);
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findByStatus(StreamStatus.LIVE)).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        List<SessionStreamingDTO> result = sessionStreamingService.getSessionsActives();

        // Then
        assertThat(result).hasSize(1);
        verify(sessionRepository).findByStatus(StreamStatus.LIVE);
    }

    @Test
    @DisplayName("Récupérer une session par ID - Succès")
    void getSessionParId_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        SessionStreamingDTO result = sessionStreamingService.getSessionParId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Récupérer une session par ID - Non trouvée")
    void getSessionParId_NotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When/Then
        assertThatThrownBy(() -> sessionStreamingService.getSessionParId(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Session introuvable");
    }

    @Test
    @DisplayName("Récupérer les sessions par cours")
    void getSessionsParCours_Success() {
        // Given
        List<SessionStreaming> sessions = Arrays.asList(session);
        when(sessionRepository.findByCoursId(1L)).thenReturn(sessions);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        List<SessionStreamingDTO> result = sessionStreamingService.getSessionsParCours(1L);

        // Then
        assertThat(result).hasSize(1);
        verify(sessionRepository).findByCoursId(1L);
    }

    @Test
    @DisplayName("Modifier une session - Succès")
    void modifierSession_Success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findById(1L)).thenReturn(Optional.of(enseignant));
        when(sessionRepository.save(any())).thenReturn(session);
        when(sessionMapper.toDTO(any())).thenReturn(sessionDTO);

        // When
        SessionStreamingDTO result = sessionStreamingService.modifierSession(1L, sessionDTO);

        // Then
        assertThat(result).isNotNull();
        verify(sessionRepository).save(any());
    }
}
