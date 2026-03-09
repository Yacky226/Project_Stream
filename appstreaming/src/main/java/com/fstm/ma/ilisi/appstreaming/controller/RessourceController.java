package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.RessourceDTO;
import com.fstm.ma.ilisi.appstreaming.service.RessourceServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ressources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RessourceController {
    
    private final RessourceServiceInterface ressourceService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<RessourceDTO> createRessource(@Valid @RequestBody RessourceDTO ressourceDTO) {
        RessourceDTO created = ressourceService.createRessource(ressourceDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<RessourceDTO> updateRessource(@PathVariable Long id, @Valid @RequestBody RessourceDTO ressourceDTO) {
        RessourceDTO updated = ressourceService.updateRessource(id, ressourceDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteRessource(@PathVariable Long id) {
        ressourceService.deleteRessource(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RessourceDTO> getRessourceById(@PathVariable Long id) {
        RessourceDTO ressource = ressourceService.getRessourceById(id);
        return ResponseEntity.ok(ressource);
    }
    
    @GetMapping("/lecon/{leconId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RessourceDTO>> getRessourcesByLecon(@PathVariable Long leconId) {
        List<RessourceDTO> ressources = ressourceService.getRessourcesByLecon(leconId);
        return ResponseEntity.ok(ressources);
    }
    
    @GetMapping("/cours/{coursId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RessourceDTO>> getRessourcesByCours(@PathVariable Long coursId) {
        List<RessourceDTO> ressources = ressourceService.getRessourcesByCours(coursId);
        return ResponseEntity.ok(ressources);
    }
}
