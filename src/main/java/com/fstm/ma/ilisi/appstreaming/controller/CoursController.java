package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.service.CoursService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/cours")
public class CoursController {

    private final CoursService coursService;

    public CoursController(CoursService coursService) {
        this.coursService = coursService;
    }

    //  Créer un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<CoursDTO> ajouterCours(@Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.ajouterCours(dto));
    }

    //  Modifier un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @PutMapping("/{id}")
    public ResponseEntity<CoursDTO> modifierCours(@PathVariable Long id, @Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.modifierCours(id, dto));
    }

    //  Supprimer un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerCours(@PathVariable Long id) {
        coursService.supprimerCours(id);
        return ResponseEntity.ok().build();
    }

    //  Voir tous les cours
    @GetMapping
    public ResponseEntity<List<CoursDTO>> getTousLesCours() {
        return ResponseEntity.ok(coursService.getTousLesCours());
    }
}
