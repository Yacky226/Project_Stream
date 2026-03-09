package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du contrôleur SessionStreaming")
class SessionStreamingControllerTest {

    @Mock
    private SessionStreamingService sessionStreamingService;

    @InjectMocks
    private SessionStreamingController controller;

    private SessionStreamingDTO sessionDTO;

    @BeforeEach
    void setUp() {
        sessionDTO = new SessionStreamingDTO();
        sessionDTO.setId(1L);
        sessionDTO.setCoursId(1L);
        sessionDTO.setEnseignantId(1L);
        sessionDTO.setDateHeure(LocalDateTime.now());
        sessionDTO.setEstEnDirect(false);
        sessionDTO.setRecordingEnabled(true);
    }

    @Test
    @DisplayName("Récupérer toutes les sessions - Succès")
    void getToutesLesSessions_Success() {
        // Given
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getToutesLesSessions()).thenReturn(sessions);

        // When
        ResponseEntity<List<SessionStreamingDTO>> response = controller.getToutesLesSessions();

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Récupérer une session par ID - Succès")
    void getSessionParId_Success() {
        // Given
        when(sessionStreamingService.getSessionParId(1L)).thenReturn(sessionDTO);

        // When
        ResponseEntity<SessionStreamingDTO> response = controller.getSessionParId(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Créer une session - Succès")
    void creerSession_Success() {
        // Given
        when(sessionStreamingService.creerSession(any())).thenReturn(sessionDTO);

        // When
        ResponseEntity<SessionStreamingDTO> response = controller.creerSession(sessionDTO);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Modifier une session - Succès")
    void modifierSession_Success() {
        // Given
        when(sessionStreamingService.modifierSession(eq(1L), any())).thenReturn(sessionDTO);

        // When
        ResponseEntity<SessionStreamingDTO> response = controller.modifierSession(1L, sessionDTO);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Supprimer une session - Succès")
    void supprimerSession_Success() {
        // When
        ResponseEntity<Void> response = controller.supprimerSession(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(sessionStreamingService).supprimerSession(1L);
    }

    @Test
    @DisplayName("Démarrer un stream - Succès")
    void demarrerStream_Success() {
        // Given
        when(sessionStreamingService.demarrerStream(1L)).thenReturn(sessionDTO);

        // When
        ResponseEntity<SessionStreamingDTO> response = controller.demarrerStream(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Arrêter un stream - Succès")
    void arreterStream_Success() {
        // Given
        when(sessionStreamingService.arreterStream(1L)).thenReturn(sessionDTO);

        // When
        ResponseEntity<SessionStreamingDTO> response = controller.arreterStream(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Récupérer les sessions actives - Succès")
    void getSessionsActives_Success() {
        // Given
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getSessionsActives()).thenReturn(sessions);

        // When
        ResponseEntity<List<SessionStreamingDTO>> response = controller.getSessionsActives();

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    @DisplayName("Récupérer les sessions par cours - Succès")
    void getSessionsParCours_Success() {
        // Given
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getSessionsParCours(1L)).thenReturn(sessions);

        // When
        ResponseEntity<List<SessionStreamingDTO>> response = controller.getSessionsParCours(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    @DisplayName("Récupérer l'URL du stream - Succès")
    void getStreamUrl_Success() {
        // Given
        String expectedUrl = "http://localhost:5080/LiveApp/streams/stream_123.m3u8";
        when(sessionStreamingService.getStreamUrl(1L)).thenReturn(expectedUrl);

        // When
        ResponseEntity<String> response = controller.getStreamUrl(1L);

        // Then
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedUrl);
    }
}
