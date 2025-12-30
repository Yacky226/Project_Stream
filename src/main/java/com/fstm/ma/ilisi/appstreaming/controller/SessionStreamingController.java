package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:5173") 
public class SessionStreamingController {

    private final SessionStreamingService sessionStreamingService;

    public SessionStreamingController(SessionStreamingService sessionStreamingService) {
        this.sessionStreamingService = sessionStreamingService;
    }

    //  Créer une nouvelle session de streaming
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<SessionStreamingDTO> creerSession(@Valid @RequestBody SessionStreamingDTO dto) {
        return ResponseEntity.ok(sessionStreamingService.creerSession(dto));
    }

    //  Modifier une session existante
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PutMapping("/{id}")
    public ResponseEntity<SessionStreamingDTO> modifierSession(@PathVariable Long id, @Valid @RequestBody SessionStreamingDTO dto) {
        return ResponseEntity.ok(sessionStreamingService.modifierSession(id, dto));
    }

    //  Supprimer une session
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerSession(@PathVariable Long id) {
        sessionStreamingService.supprimerSession(id);
        return ResponseEntity.ok().build();
    }

    //  Obtenir toutes les sessions
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<SessionStreamingDTO>> getToutesLesSessions() {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessions());
    }

    //  Obtenir une session par ID
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<SessionStreamingDTO> getSessionParId(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.getSessionParId(id));
    }

    //  Obtenir les sessions d’un cours
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsParCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(sessionStreamingService.getSessionsParCours(coursId));
    }

    // ✅ Obtenir les sessions actives (en direct)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/actives")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsActives() {
        return ResponseEntity.ok(sessionStreamingService.getSessionsActives());
    }

    // ✅ Démarrer un stream
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/start")
    public ResponseEntity<SessionStreamingDTO> demarrerStream(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.demarrerStream(id));
    }

    //  Arrêter un stream
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/stop")
    public ResponseEntity<SessionStreamingDTO> arreterStream(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.arreterStream(id));
    }

    //  Obtenir l'URL du flux vidéo (live ou replay)
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/url")
    public ResponseEntity<String> getStreamUrl(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.getStreamUrl(id));
    }

    // ✅ Rejoindre une session (avec vérification d'inscription au cours)
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @PostMapping("/{sessionId}/join/{etudiantId}")
    public ResponseEntity<SessionStreamingDTO> joinSession(
            @PathVariable Long sessionId,
            @PathVariable Long etudiantId) {
        return ResponseEntity.ok(sessionStreamingService.joinSession(sessionId, etudiantId));
    }

    // ✅ Récupérer manuellement l'URL du VOD depuis Ant Media
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping("/{id}/fetch-vod")
    public ResponseEntity<String> fetchVod(@PathVariable Long id) {
        sessionStreamingService.updateRecordingUrl(id);
        return ResponseEntity.ok("VOD récupéré avec succès");
    }
}

