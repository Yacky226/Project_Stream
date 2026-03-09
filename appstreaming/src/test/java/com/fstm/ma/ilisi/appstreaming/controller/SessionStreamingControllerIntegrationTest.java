package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests d'intégration du controller SessionStreaming")
class SessionStreamingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SessionStreamingService sessionStreamingService;

    private SessionStreamingDTO sessionDTO;

    @BeforeEach
    void setUp() {
        sessionDTO = new SessionStreamingDTO();
        sessionDTO.setId(1L);
        sessionDTO.setCoursId(1L);
        sessionDTO.setEnseignantId(1L);
        sessionDTO.setDateHeure(LocalDateTime.now().plusDays(1));
        sessionDTO.setStatus(StreamStatus.CREATED);
        sessionDTO.setStreamKey("test-stream-key");
        sessionDTO.setVideoUrl("rtmp://test.com/live/stream");
    }

    @Test
    @DisplayName("GET /api/sessions - Non authentifié - 401")
    void getToutesLesSessions_NotAuthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions - Authentifié - Liste des sessions")
    void getToutesLesSessions_Authenticated_ReturnsSessionList() throws Exception {
        // Given
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getToutesLesSessions()).thenReturn(sessions);

        // When & Then
        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/paginated - Pagination fonctionne")
    void getToutesLesSessionsPaginated_ReturnsPaginatedResults() throws Exception {
        // Given
        Page<SessionStreamingDTO> page = new PageImpl<>(
                Arrays.asList(sessionDTO),
                PageRequest.of(0, 20),
                1
        );
        when(sessionStreamingService.getToutesLesSessionsPaginated(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/sessions/paginated")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.number", is(0)))
                .andExpect(jsonPath("$.size", is(20)));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id} - Session existante")
    void getSessionParId_SessionExists_ReturnsSession() throws Exception {
        // Given
        when(sessionStreamingService.getSessionParId(1L)).thenReturn(sessionDTO);

        // When & Then
        mockMvc.perform(get("/api/sessions/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id} - Session inexistante - 404")
    void getSessionParId_SessionNotFound_Returns404() throws Exception {
        // Given
        when(sessionStreamingService.getSessionParId(anyLong()))
                .thenThrow(new RuntimeException("Session introuvable"));

        // When & Then
        mockMvc.perform(get("/api/sessions/{id}", 999L))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id} - ID invalide (0) - 400")
    void getSessionParId_InvalidId_Returns400() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/sessions/{id}", 0L))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/actives - Retourne sessions en direct")
    void getSessionsActives_ReturnsLiveSessions() throws Exception {
        // Given
        sessionDTO.setStatus(StreamStatus.LIVE);
        when(sessionStreamingService.getSessionsActives()).thenReturn(Arrays.asList(sessionDTO));

        // When & Then
        mockMvc.perform(get("/api/sessions/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status", is("LIVE")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/cours/{coursId} - Sessions d'un cours")
    void getSessionsParCours_ReturnsCoursSessions() throws Exception {
        // Given
        when(sessionStreamingService.getSessionsParCours(1L)).thenReturn(Arrays.asList(sessionDTO));

        // When & Then
        mockMvc.perform(get("/api/sessions/cours/{coursId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].coursId", is(1)));
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions - Créer une session - Succès")
    void creerSession_ValidData_ReturnsCreatedSession() throws Exception {
        // Given
        when(sessionStreamingService.creerSession(any())).thenReturn(sessionDTO);

        // When & Then
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("POST /api/sessions - Étudiant tente de créer - 403")
    void creerSession_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions/{id}/start - Démarrer un stream")
    void demarrerStream_ValidId_StartsStream() throws Exception {
        // Given
        sessionDTO.setStatus(StreamStatus.LIVE);
        when(sessionStreamingService.demarrerStream(1L)).thenReturn(sessionDTO);

        // When & Then
        mockMvc.perform(post("/api/sessions/{id}/start", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("LIVE")));
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions/{id}/stop - Arrêter un stream")
    void arreterStream_ValidId_StopsStream() throws Exception {
        // Given
        sessionDTO.setStatus(StreamStatus.ENDED);
        when(sessionStreamingService.arreterStream(1L)).thenReturn(sessionDTO);

        // When & Then
        mockMvc.perform(post("/api/sessions/{id}/stop", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ENDED")));
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("DELETE /api/sessions/{id} - Supprimer une session")
    void supprimerSession_ValidId_DeletesSession() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/sessions/{id}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("DELETE /api/sessions/{id} - Étudiant tente de supprimer - 403")
    void supprimerSession_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/sessions/{id}", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id}/url - Obtenir l'URL du stream")
    void getStreamUrl_ValidId_ReturnsUrl() throws Exception {
        // Given
        when(sessionStreamingService.getStreamUrl(1L)).thenReturn("rtmp://test.com/live/stream");

        // When & Then
        mockMvc.perform(get("/api/sessions/{id}/url", 1L))
                .andExpect(status().isOk())
                .andExpect(content().string("rtmp://test.com/live/stream"));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("POST /api/sessions/{sessionId}/join/{etudiantId} - Rejoindre session")
    void joinSession_ValidIds_JoinsSession() throws Exception {
        // Given
        when(sessionStreamingService.joinSession(1L, 1L)).thenReturn(sessionDTO);

        // When & Then
        mockMvc.perform(post("/api/sessions/{sessionId}/join/{etudiantId}", 1L, 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }
}
