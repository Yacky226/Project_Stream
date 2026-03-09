package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173") 
@Tag(name = "Sessions Streaming", description = "Gestion des sessions de streaming en direct")
@SecurityRequirement(name = "bearer-jwt")
@Validated
public class SessionStreamingController {

    private final SessionStreamingService sessionStreamingService;

    public SessionStreamingController(SessionStreamingService sessionStreamingService) {
        this.sessionStreamingService = sessionStreamingService;
    }

    @Operation(summary = "Créer une nouvelle session de streaming", 
               description = "Permet à un enseignant de créer une nouvelle session de streaming pour un cours")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides"),
        @ApiResponse(responseCode = "404", description = "Cours ou enseignant introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<SessionStreamingDTO> creerSession(@Valid @RequestBody SessionStreamingDTO dto) {
        return ResponseEntity.ok(sessionStreamingService.creerSession(dto));
    }

    @Operation(summary = "Modifier une session existante")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session modifiée avec succès"),
        @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PutMapping("/{id}")
    public ResponseEntity<SessionStreamingDTO> modifierSession(@PathVariable Long id, @Valid @RequestBody SessionStreamingDTO dto) {
        return ResponseEntity.ok(sessionStreamingService.modifierSession(id, dto));
    }

    @Operation(summary = "Supprimer une session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session supprimée"),
        @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerSession(@PathVariable Long id) {
        sessionStreamingService.supprimerSession(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obtenir toutes les sessions")
    @ApiResponse(responseCode = "200", description = "Liste des sessions récupérée")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<SessionStreamingDTO>> getToutesLesSessions() {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessions());
    }

    @Operation(summary = "Obtenir toutes les sessions (paginé)", 
               description = "Version paginée pour de meilleures performances avec beaucoup de données")
    @ApiResponse(responseCode = "200", description = "Page de sessions récupérée")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/paginated")
    public ResponseEntity<Page<SessionStreamingDTO>> getToutesLesSessionsPaginated(
            @PageableDefault(size = 20, sort = "dateHeure") Pageable pageable) {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessionsPaginated(pageable));
    }

    @Operation(summary = "Obtenir une session par ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session trouvée"),
        @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<SessionStreamingDTO> getSessionParId(
            @Parameter(description = "ID de la session", required = true)
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(sessionStreamingService.getSessionParId(id));
    }

    @Operation(summary = "Obtenir les sessions d'un cours spécifique")
    @ApiResponse(responseCode = "200", description = "Liste des sessions du cours")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsParCours(
            @Parameter(description = "ID du cours")
            @PathVariable @Min(1) Long coursId) {
        return ResponseEntity.ok(sessionStreamingService.getSessionsParCours(coursId));
    }

    @Operation(summary = "Obtenir les sessions d'un cours (paginé)")
    @ApiResponse(responseCode = "200", description = "Page de sessions du cours")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}/paginated")
    public ResponseEntity<Page<SessionStreamingDTO>> getSessionsParCoursPaginated(
            @Parameter(description = "ID du cours")
            @PathVariable @Min(1) Long coursId,
            @PageableDefault(size = 10, sort = "dateHeure") Pageable pageable) {
        return ResponseEntity.ok(sessionStreamingService.getSessionsParCoursPaginated(coursId, pageable));
    }

    @Operation(summary = "Obtenir les sessions actives (en direct)")
    @ApiResponse(responseCode = "200", description = "Liste des sessions en direct")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/actives")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsActives() {
        return ResponseEntity.ok(sessionStreamingService.getSessionsActives());
    }

    @Operation(summary = "Démarrer un stream", 
               description = "L'enseignant démarre la diffusion en direct d'une session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stream démarré"),
        @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/start")
    public ResponseEntity<SessionStreamingDTO> demarrerStream(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.demarrerStream(id));
    }

    @Operation(summary = "Arrêter un stream", 
               description = "L'enseignant arrête la diffusion en direct")
    @ApiResponse(responseCode = "200", description = "Stream arrêté")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/stop")
    public ResponseEntity<SessionStreamingDTO> arreterStream(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.arreterStream(id));
    }

    @Operation(summary = "Obtenir l'URL du flux vidéo", 
               description = "Récupère l'URL du flux live ou du replay enregistré")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "URL récupérée"),
        @ApiResponse(responseCode = "404", description = "Session introuvable"),
        @ApiResponse(responseCode = "400", description = "Aucun flux disponible")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/url")
    public ResponseEntity<String> getStreamUrl(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.getStreamUrl(id));
    }

    @Operation(summary = "Rejoindre une session", 
               description = "Un étudiant inscrit au cours peut rejoindre la session")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Session rejointe"),
        @ApiResponse(responseCode = "403", description = "Non inscrit au cours"),
        @ApiResponse(responseCode = "404", description = "Session ou étudiant introuvable")
    })
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @PostMapping("/{sessionId}/join/{etudiantId}")
    public ResponseEntity<SessionStreamingDTO> joinSession(
            @PathVariable Long sessionId,
            @PathVariable Long etudiantId) {
        return ResponseEntity.ok(sessionStreamingService.joinSession(sessionId, etudiantId));
    }

    @Operation(summary = "Récupérer l'URL du VOD", 
               description = "Récupère manuellement l'URL du VOD depuis Ant Media Server")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "VOD récupéré avec succès"),
        @ApiResponse(responseCode = "400", description = "Le stream n'est pas terminé"),
        @ApiResponse(responseCode = "404", description = "VOD pas encore disponible")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/fetch-vod")
    public ResponseEntity<String> fetchVod(@PathVariable Long id) {
        sessionStreamingService.updateRecordingUrl(id);
        return ResponseEntity.ok("VOD récupéré avec succès");
    }
}

