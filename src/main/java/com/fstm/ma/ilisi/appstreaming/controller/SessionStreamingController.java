package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.SessionStreamingDTO;
import com.fstm.ma.ilisi.appstreaming.service.SessionStreamingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionStreamingController {

    private final SessionStreamingService sessionStreamingService;

    public SessionStreamingController(SessionStreamingService sessionStreamingService) {
        this.sessionStreamingService = sessionStreamingService;
    }

    // 🔥 Créer une session
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<SessionStreamingDTO> creerSession(@Valid @RequestBody SessionStreamingDTO dto) {
        return ResponseEntity.ok(sessionStreamingService.creerSession(dto));
    }

    //  Modifier une session
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

    //  Voir toutes les sessions
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SessionStreamingDTO>> getToutesLesSessions() {
        return ResponseEntity.ok(sessionStreamingService.getToutesLesSessions());
    }

    //  Voir une session par ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SessionStreamingDTO> getSessionParId(@PathVariable Long id) {
        return ResponseEntity.ok(sessionStreamingService.getSessionParId(id));
    }

    //  Voir les sessions d'un cours
    @GetMapping("/cours/{coursId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SessionStreamingDTO>> getSessionsParCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(sessionStreamingService.getSessionsParCours(coursId));
    }
}
