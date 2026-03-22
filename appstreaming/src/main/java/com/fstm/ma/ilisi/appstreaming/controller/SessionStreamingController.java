package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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

    @Operation(summary = "Creer une nouvelle session de streaming")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session creee avec succes"),
            @ApiResponse(responseCode = "400", description = "Donnees invalides"),
            @ApiResponse(responseCode = "404", description = "Cours ou enseignant introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<SessionStreamingDTO> creerSession(
            @Valid @RequestBody SessionStreamingDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.creerSession(dto, userDetails.getUsername()));
    }

    @Operation(summary = "Modifier une session existante")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session modifiee avec succes"),
            @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<SessionStreamingDTO> modifierSession(
            @PathVariable Long id,
            @Valid @RequestBody SessionStreamingDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.modifierSession(id, dto, userDetails.getUsername()));
    }

    @Operation(summary = "Supprimer une session")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session supprimee"),
            @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> supprimerSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        sessionStreamingService.supprimerSession(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Obtenir toutes les sessions")
    @ApiResponse(responseCode = "200", description = "Liste des sessions recuperee")
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<SessionStreamingDTO>> getToutesLesSessions() {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessions());
    }

    @Operation(summary = "Obtenir toutes les sessions (pagine)")
    @ApiResponse(responseCode = "200", description = "Page de sessions recuperee")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/paginated")
    public ResponseEntity<Page<SessionStreamingDTO>> getToutesLesSessionsPaginated(
            @PageableDefault(size = 20, sort = "dateHeure") Pageable pageable) {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessionsPaginated(pageable));
    }

    @Operation(summary = "Obtenir une session par ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session trouvee"),
            @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<SessionStreamingDTO> getSessionParId(
            @Parameter(description = "ID de la session", required = true)
            @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(sessionStreamingService.getSessionParId(id));
    }

    @Operation(summary = "Obtenir les sessions d'un cours specifique")
    @ApiResponse(responseCode = "200", description = "Liste des sessions du cours")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsParCours(
            @Parameter(description = "ID du cours")
            @PathVariable @Min(1) Long coursId) {
        return ResponseEntity.ok(sessionStreamingService.getSessionsParCours(coursId));
    }

    @Operation(summary = "Obtenir la session live (ou la plus recente) d'un cours")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session trouvee"),
            @ApiResponse(responseCode = "404", description = "Aucune session disponible")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}/live")
    public ResponseEntity<SessionStreamingDTO> getSessionLiveParCours(@PathVariable @Min(1) Long coursId) {
        List<SessionStreamingDTO> sessions = sessionStreamingService.getSessionsParCours(coursId);
        Optional<SessionStreamingDTO> live = sessions.stream()
                .filter(SessionStreamingDTO::isLive)
                .findFirst();
        if (live.isPresent()) {
            return ResponseEntity.ok(live.get());
        }

        return sessions.stream()
                .max(Comparator.comparing(SessionStreamingDTO::getDateHeure))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Obtenir mes sessions enseignant")
    @ApiResponse(responseCode = "200", description = "Liste des sessions de l'enseignant connecte")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @GetMapping("/enseignant/me")
    public ResponseEntity<List<SessionStreamingDTO>> getMesSessionsEnseignant(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.getMesSessionsEnseignant(userDetails.getUsername()));
    }

    @Operation(summary = "Obtenir les sessions d'un cours (pagine)")
    @ApiResponse(responseCode = "200", description = "Page de sessions du cours")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}/paginated")
    public ResponseEntity<Page<SessionStreamingDTO>> getSessionsParCoursPaginated(
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

    @Operation(summary = "Demarrer un stream")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Stream demarre"),
            @ApiResponse(responseCode = "404", description = "Session introuvable")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id:\\d+}/start")
    public ResponseEntity<SessionStreamingDTO> demarrerStream(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.demarrerStream(id, userDetails.getUsername()));
    }

    @Operation(summary = "Arreter un stream")
    @ApiResponse(responseCode = "200", description = "Stream arrete")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id:\\d+}/stop")
    public ResponseEntity<SessionStreamingDTO> arreterStream(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.arreterStream(id, userDetails.getUsername()));
    }

    @Operation(summary = "Obtenir l'URL du flux video")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "URL recuperee"),
            @ApiResponse(responseCode = "404", description = "Session introuvable"),
            @ApiResponse(responseCode = "400", description = "Aucun flux disponible")
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id:\\d+}/url")
    public ResponseEntity<String> getStreamUrl(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.getStreamUrl(id));
    }

    @Operation(summary = "Rejoindre une session avec l'etudiant connecte")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session rejointe"),
            @ApiResponse(responseCode = "403", description = "Non inscrit au cours"),
            @ApiResponse(responseCode = "404", description = "Session ou etudiant introuvable")
    })
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @PostMapping("/{sessionId}/join")
    public ResponseEntity<SessionStreamingDTO> joinSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sessionStreamingService.joinSession(sessionId, userDetails.getUsername()));
    }

    @Operation(summary = "Rejoindre une session via l'identifiant etudiant (compatibilite)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session rejointe"),
            @ApiResponse(responseCode = "403", description = "Non inscrit au cours"),
            @ApiResponse(responseCode = "404", description = "Session ou etudiant introuvable")
    })
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @PostMapping("/{sessionId}/join/{etudiantId}")
    public ResponseEntity<SessionStreamingDTO> joinSessionById(
            @PathVariable Long sessionId,
            @PathVariable Long etudiantId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Endpoint kept for compatibility: always joins with the authenticated student identity.
        return ResponseEntity.ok(sessionStreamingService.joinSession(sessionId, userDetails.getUsername()));
    }

    @Operation(summary = "Recuperer l'URL du VOD")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "VOD recupere avec succes"),
            @ApiResponse(responseCode = "400", description = "Le stream n'est pas termine"),
            @ApiResponse(responseCode = "404", description = "VOD pas encore disponible")
    })
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id:\\d+}/fetch-vod")
    public ResponseEntity<String> fetchVod(@PathVariable Long id) {
        sessionStreamingService.updateRecordingUrl(id);
        return ResponseEntity.ok("VOD recupere avec succes");
    }
}
