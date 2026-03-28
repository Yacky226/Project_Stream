package com.fstm.ma.ilisi.appstreaming.controller;

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
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du controleur SessionStreaming")
class SessionStreamingControllerTest {

    private static final String TEACHER_EMAIL = "teacher@test.com";

    @Mock
    private SessionStreamingService sessionStreamingService;

    @Mock
    private UserDetails userDetails;

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

    private void stubTeacherIdentity() {
        when(userDetails.getUsername()).thenReturn(TEACHER_EMAIL);
    }

    @Test
    @DisplayName("Recuperer toutes les sessions - Success")
    void getToutesLesSessions_Success() {
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getToutesLesSessions()).thenReturn(sessions);

        ResponseEntity<List<SessionStreamingDTO>> response = controller.getToutesLesSessions();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Recuperer une session par ID - Success")
    void getSessionParId_Success() {
        when(sessionStreamingService.getSessionParId(1L)).thenReturn(sessionDTO);

        ResponseEntity<SessionStreamingDTO> response = controller.getSessionParId(1L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Creer une session - Success")
    void creerSession_Success() {
        stubTeacherIdentity();
        when(sessionStreamingService.creerSession(any(), eq(TEACHER_EMAIL))).thenReturn(sessionDTO);

        ResponseEntity<SessionStreamingDTO> response = controller.creerSession(sessionDTO, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Modifier une session - Success")
    void modifierSession_Success() {
        stubTeacherIdentity();
        when(sessionStreamingService.modifierSession(eq(1L), any(), eq(TEACHER_EMAIL))).thenReturn(sessionDTO);

        ResponseEntity<SessionStreamingDTO> response = controller.modifierSession(1L, sessionDTO, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Supprimer une session - Success")
    void supprimerSession_Success() {
        stubTeacherIdentity();
        ResponseEntity<Void> response = controller.supprimerSession(1L, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        verify(sessionStreamingService).supprimerSession(1L, TEACHER_EMAIL);
    }

    @Test
    @DisplayName("Demarrer un stream - Success")
    void demarrerStream_Success() {
        stubTeacherIdentity();
        when(sessionStreamingService.demarrerStream(1L, TEACHER_EMAIL)).thenReturn(sessionDTO);

        ResponseEntity<SessionStreamingDTO> response = controller.demarrerStream(1L, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Arreter un stream - Success")
    void arreterStream_Success() {
        stubTeacherIdentity();
        when(sessionStreamingService.arreterStream(1L, TEACHER_EMAIL)).thenReturn(sessionDTO);

        ResponseEntity<SessionStreamingDTO> response = controller.arreterStream(1L, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Recuperer les sessions actives - Success")
    void getSessionsActives_Success() {
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getSessionsActives()).thenReturn(sessions);

        ResponseEntity<List<SessionStreamingDTO>> response = controller.getSessionsActives();

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    @DisplayName("Recuperer les sessions par cours - Success")
    void getSessionsParCours_Success() {
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getSessionsParCours(1L)).thenReturn(sessions);

        ResponseEntity<List<SessionStreamingDTO>> response = controller.getSessionsParCours(1L);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).hasSize(1);
    }

    @Test
    @DisplayName("Recuperer l URL du stream - Success")
    void getStreamUrl_Success() {
        stubTeacherIdentity();
        String expectedUrl = "https://meet.livekit.io/custom?liveKitUrl=ws%3A%2F%2Flocalhost%3A7880&token=test-token";
        when(sessionStreamingService.getStreamUrl(1L, TEACHER_EMAIL)).thenReturn(expectedUrl);

        ResponseEntity<String> response = controller.getStreamUrl(1L, userDetails);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedUrl);
    }
}
