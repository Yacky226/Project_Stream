package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ProgressionLeconDTO;
import com.fstm.ma.ilisi.appstreaming.service.InscriptionServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InscriptionController {
    
    private final InscriptionServiceInterface inscriptionService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<InscriptionDTO> inscrireEtudiant(@RequestParam Long etudiantId, @RequestParam Long coursId) {
        InscriptionDTO inscription = inscriptionService.inscrireEtudiant(etudiantId, coursId);
        return new ResponseEntity<>(inscription, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InscriptionDTO> getInscriptionById(@PathVariable Long id) {
        InscriptionDTO inscription = inscriptionService.getInscriptionById(id);
        return ResponseEntity.ok(inscription);
    }
    
    @GetMapping("/etudiant/{etudiantId}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<InscriptionDTO>> getInscriptionsByEtudiant(@PathVariable Long etudiantId) {
        List<InscriptionDTO> inscriptions = inscriptionService.getInscriptionsByEtudiant(etudiantId);
        return ResponseEntity.ok(inscriptions);
    }
    
    @GetMapping("/cours/{coursId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<InscriptionDTO>> getInscriptionsByCours(@PathVariable Long coursId) {
        List<InscriptionDTO> inscriptions = inscriptionService.getInscriptionsByCours(coursId);
        return ResponseEntity.ok(inscriptions);
    }
    
    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Boolean> isEtudiantInscrit(@RequestParam Long etudiantId, @RequestParam Long coursId) {
        boolean isInscrit = inscriptionService.isEtudiantInscrit(etudiantId, coursId);
        return ResponseEntity.ok(isInscrit);
    }
    
    @PostMapping("/{inscriptionId}/lecon/{leconId}/complete")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<ProgressionLeconDTO> marquerLeconTerminee(
            @PathVariable Long inscriptionId, 
            @PathVariable Long leconId) {
        ProgressionLeconDTO progression = inscriptionService.marquerLeconTerminee(inscriptionId, leconId);
        return ResponseEntity.ok(progression);
    }
    
    @DeleteMapping("/{inscriptionId}/lecon/{leconId}/complete")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<ProgressionLeconDTO> marquerLeconNonTerminee(
            @PathVariable Long inscriptionId, 
            @PathVariable Long leconId) {
        ProgressionLeconDTO progression = inscriptionService.marquerLeconNonTerminee(inscriptionId, leconId);
        return ResponseEntity.ok(progression);
    }
    
    @GetMapping("/{inscriptionId}/progression")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProgressionLeconDTO>> getProgression(@PathVariable Long inscriptionId) {
        List<ProgressionLeconDTO> progression = inscriptionService.getProgressionByInscription(inscriptionId);
        return ResponseEntity.ok(progression);
    }
    
    @GetMapping("/{inscriptionId}/progression/calcul")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Double> calculerProgression(@PathVariable Long inscriptionId) {
        Double progression = inscriptionService.calculerProgression(inscriptionId);
        return ResponseEntity.ok(progression);
    }
}
