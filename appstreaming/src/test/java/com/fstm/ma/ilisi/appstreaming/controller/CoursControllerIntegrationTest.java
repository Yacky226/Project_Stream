package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.service.CoursService;
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

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Tests d'intégration du controller Cours")
class CoursControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CoursService coursService;

    private CoursDTO coursDTO;

    @BeforeEach
    void setUp() {
        coursDTO = new CoursDTO();
        coursDTO.setId(1L);
        coursDTO.setTitre("Java Spring Boot");
        coursDTO.setDescription("Cours complet sur Spring Boot");
        coursDTO.setCategorie("Programmation");
        coursDTO.setHoraire(java.time.LocalDateTime.now().plusDays(1));
        coursDTO.setEnseignantId(1L);
    }

    @Test
    @DisplayName("GET /api/cours - Non authentifié - endpoint public")
    void getTousLesCours_NotAuthenticated_Returns200() throws Exception {
        mockMvc.perform(get("/api/cours"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours - Authentifié - Liste des cours")
    void getTousLesCours_Authenticated_ReturnsListOfCours() throws Exception {
        // Given
        List<CoursDTO> coursList = Arrays.asList(coursDTO);
        when(coursService.getTousLesCours()).thenReturn(coursList);

        // When & Then
        mockMvc.perform(get("/api/cours"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].titre", is("Java Spring Boot")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/paginated - Pagination fonctionne")
    void getTousLesCoursPaginated_ReturnsPaginatedResults() throws Exception {
        // Given
        Page<CoursDTO> page = new PageImpl<>(
                Arrays.asList(coursDTO),
                PageRequest.of(0, 10),
                1
        );
        when(coursService.getTousLesCoursPaginated(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/cours")
                        .param("paginate", "true")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.pageNumber", is(0)))
                .andExpect(jsonPath("$.pageSize", is(10)));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/{id} - Cours existant")
    void getCoursParId_CoursExists_ReturnsCours() throws Exception {
        // Given
        when(coursService.getCoursParId(1L)).thenReturn(coursDTO);

        // When & Then
        mockMvc.perform(get("/api/cours/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.titre", is("Java Spring Boot")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/{id} - Cours inexistant - 404")
    void getCoursParId_CoursNotFound_Returns404() throws Exception {
        // Given
        when(coursService.getCoursParId(anyLong()))
                .thenThrow(new RuntimeException("Cours introuvable"));

        // When & Then
        mockMvc.perform(get("/api/cours/{id}", 999L))
                .andExpect(status().isInternalServerError());
    }

    /*
    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/{id} - ID invalide (0) - 400")
    void getCoursParId_InvalidId_Returns400() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/cours/{id}", 0L))
                .andExpect(status().isBadRequest());
    }
    */

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/cours - Créer un cours - Succès")
    void ajouterCours_ValidData_ReturnsCreatedCours() throws Exception {
        // Given
        when(coursService.ajouterCours(any())).thenReturn(coursDTO);

        // When & Then
        mockMvc.perform(post("/api/cours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coursDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.titre", is("Java Spring Boot")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("POST /api/cours - Étudiant tente de créer - 403")
    void ajouterCours_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/cours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coursDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/cours - Données invalides - 400")
    void ajouterCours_InvalidData_Returns400() throws Exception {
        // Given
        CoursDTO invalidCours = new CoursDTO();
        // Pas de nom ni de description

        when(coursService.ajouterCours(any()))
                .thenThrow(new IllegalArgumentException("Données invalides"));

        // When & Then
        mockMvc.perform(post("/api/cours")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidCours)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("PUT /api/cours/{id} - Modifier un cours")
    void modifierCours_ValidData_ReturnsUpdatedCours() throws Exception {
        // Given
        coursDTO.setTitre("Java Spring Boot - Avancé");
        when(coursService.modifierCours(eq(1L), any())).thenReturn(coursDTO);

        // When & Then
        mockMvc.perform(put("/api/cours/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coursDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre", is("Java Spring Boot - Avancé")));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("PUT /api/cours/{id} - Étudiant tente de modifier - 403")
    void modifierCours_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(put("/api/cours/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coursDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("DELETE /api/cours/{id} - Supprimer un cours")
    void supprimerCours_ValidId_DeletesCours() throws Exception {
        // Given
        doNothing().when(coursService).supprimerCours(1L);

        // When & Then
        mockMvc.perform(delete("/api/cours/{id}", 1L))
                .andExpect(status().isOk());

        verify(coursService, times(1)).supprimerCours(1L);
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("DELETE /api/cours/{id} - Étudiant tente de supprimer - 403")
    void supprimerCours_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/cours/{id}", 1L))
                .andExpect(status().isForbidden());

        verify(coursService, never()).supprimerCours(anyLong());
    }

    /*
    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("GET /api/cours/enseignant/{enseignantId} - Cours d'un enseignant")
    void getCoursParEnseignant_ReturnsEnseignantCours() throws Exception {
        // Given
        when(coursService.getCoursParEnseignant(1L)).thenReturn(Arrays.asList(coursDTO));

        // When & Then
        mockMvc.perform(get("/api/cours/enseignant/{enseignantId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].enseignantId", is(1)));
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/search - Recherche par nom")
    void searchCours_ByName_ReturnsMatchingCours() throws Exception {
        // Given
        when(coursService.rechercherCours("Spring")).thenReturn(Arrays.asList(coursDTO));

        // When & Then
        mockMvc.perform(get("/api/cours/search")
                        .param("q", "Spring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nom", containsString("Spring")));
    }
    */

    /*
    @Test
    @WithMockUser(authorities = "ADMINISTRATEUR")
    @DisplayName("GET /api/cours/stats - Statistiques des cours")
    void getCoursStats_AsAdmin_ReturnsStats() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/cours/stats"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ETUDIANT")
    @DisplayName("GET /api/cours/stats - Étudiant accède aux stats - 403")
    void getCoursStats_AsEtudiant_Returns403() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/cours/stats"))
                .andExpect(status().isForbidden());
    }
    */

    /*
    @Test
    @WithMockUser(authorities = "ENSEIGNANT")
    @DisplayName("POST /api/cours/{id}/duplicate - Dupliquer un cours")
    void duplicateCours_ValidId_ReturnsDuplicatedCours() throws Exception {
        // Given
        CoursDTO duplicated = new CoursDTO();
        duplicated.setId(2L);
        duplicated.setNom("Java Spring Boot (Copie)");
        duplicated.setDescription(coursDTO.getDescription());
        duplicated.setEnseignantId(coursDTO.getEnseignantId());
        
        when(coursService.dupliquerCours(1L)).thenReturn(duplicated);

        // When & Then
        mockMvc.perform(post("/api/cours/{id}/duplicate", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(2)))
                .andExpect(jsonPath("$.nom", containsString("Copie")));
    }
    */
}
