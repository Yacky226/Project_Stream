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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests d integration du controller SessionStreaming")
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
        sessionDTO.setVideoUrl("livekit://room/test-stream-key");
    }

    @Test
    @DisplayName("GET /api/sessions - Non authentifie - 403")
    void getToutesLesSessions_NotAuthenticated_Returns403() throws Exception {
        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions - Authentifie - Liste des sessions")
    void getToutesLesSessions_Authenticated_ReturnsSessionList() throws Exception {
        List<SessionStreamingDTO> sessions = Arrays.asList(sessionDTO);
        when(sessionStreamingService.getToutesLesSessions()).thenReturn(sessions);

        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/paginated - Pagination fonctionne")
    void getToutesLesSessionsPaginated_ReturnsPaginatedResults() throws Exception {
        Page<SessionStreamingDTO> page = new PageImpl<>(
                Arrays.asList(sessionDTO),
                PageRequest.of(0, 20),
                1
        );
        when(sessionStreamingService.getToutesLesSessionsPaginated(any())).thenReturn(page);

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
        when(sessionStreamingService.getSessionParId(1L)).thenReturn(sessionDTO);

        mockMvc.perform(get("/api/sessions/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id} - Session inexistante")
    void getSessionParId_SessionNotFound_Returns500() throws Exception {
        when(sessionStreamingService.getSessionParId(anyLong()))
                .thenThrow(new RuntimeException("Session introuvable"));

        mockMvc.perform(get("/api/sessions/{id}", 999L))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id} - ID invalide")
    void getSessionParId_InvalidId_Returns400() throws Exception {
        mockMvc.perform(get("/api/sessions/{id}", 0L))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/actives - Retourne sessions live")
    void getSessionsActives_ReturnsLiveSessions() throws Exception {
        sessionDTO.setStatus(StreamStatus.LIVE);
        when(sessionStreamingService.getSessionsActives()).thenReturn(Arrays.asList(sessionDTO));

        mockMvc.perform(get("/api/sessions/actives"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status", is("LIVE")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/cours/{coursId} - Sessions du cours")
    void getSessionsParCours_ReturnsCoursSessions() throws Exception {
        when(sessionStreamingService.getSessionsParCours(1L)).thenReturn(Arrays.asList(sessionDTO));

        mockMvc.perform(get("/api/sessions/cours/{coursId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].coursId", is(1)));
    }

    @Test
    @WithMockUser(username = "teacher@test.com", authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions - Creer une session")
    void creerSession_ValidData_ReturnsCreatedSession() throws Exception {
        when(sessionStreamingService.creerSession(any(), anyString())).thenReturn(sessionDTO);

        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.streamKey", is("test-stream-key")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("POST /api/sessions - Etudiant tente de creer")
    void creerSession_AsEtudiant_Returns403() throws Exception {
        mockMvc.perform(post("/api/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "teacher@test.com", authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions/{id}/start - Demarrer stream")
    void demarrerStream_ValidId_StartsStream() throws Exception {
        sessionDTO.setStatus(StreamStatus.LIVE);
        when(sessionStreamingService.demarrerStream(1L, "teacher@test.com")).thenReturn(sessionDTO);

        mockMvc.perform(post("/api/sessions/{id}/start", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("LIVE")));
    }

    @Test
    @WithMockUser(username = "teacher@test.com", authorities = "ENSEIGNANT")
    @DisplayName("POST /api/sessions/{id}/stop - Arreter stream")
    void arreterStream_ValidId_StopsStream() throws Exception {
        sessionDTO.setStatus(StreamStatus.ENDED);
        when(sessionStreamingService.arreterStream(1L, "teacher@test.com")).thenReturn(sessionDTO);

        mockMvc.perform(post("/api/sessions/{id}/stop", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("ENDED")));
    }

    @Test
    @WithMockUser(username = "teacher@test.com", authorities = "ENSEIGNANT")
    @DisplayName("DELETE /api/sessions/{id} - Supprimer session")
    void supprimerSession_ValidId_DeletesSession() throws Exception {
        mockMvc.perform(delete("/api/sessions/{id}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("DELETE /api/sessions/{id} - Etudiant interdit")
    void supprimerSession_AsEtudiant_Returns403() throws Exception {
        mockMvc.perform(delete("/api/sessions/{id}", 1L))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "student@test.com", authorities = "ETUDIANT")
    @DisplayName("GET /api/sessions/{id}/url - Obtenir URL stream")
    void getStreamUrl_ValidId_ReturnsUrl() throws Exception {
        when(sessionStreamingService.getStreamUrl(1L, "student@test.com"))
                .thenReturn("https://meet.livekit.io/custom?liveKitUrl=ws%3A%2F%2Flocalhost%3A7880&token=test-token");

        mockMvc.perform(get("/api/sessions/{id}/url", 1L))
                .andExpect(status().isOk())
                .andExpect(content().string("https://meet.livekit.io/custom?liveKitUrl=ws%3A%2F%2Flocalhost%3A7880&token=test-token"));
    }

    @Test
    @WithMockUser(username = "student@test.com", authorities = "ETUDIANT")
    @DisplayName("POST /api/sessions/{sessionId}/join/{etudiantId} - Join session")
    void joinSession_ValidIds_JoinsSession() throws Exception {
        when(sessionStreamingService.joinSession(1L, "student@test.com")).thenReturn(sessionDTO);

        mockMvc.perform(post("/api/sessions/{sessionId}/join/{etudiantId}", 1L, 999L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)));
    }
}
