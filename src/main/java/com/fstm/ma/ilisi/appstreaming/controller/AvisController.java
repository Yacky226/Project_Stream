package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.AvisDTO;
import com.fstm.ma.ilisi.appstreaming.service.AvisServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AvisController {
    
    private final AvisServiceInterface avisService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<AvisDTO> creerAvis(@Valid @RequestBody AvisDTO avisDTO) {
        AvisDTO created = avisService.creerAvis(avisDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<AvisDTO> updateAvis(@PathVariable Long id, @Valid @RequestBody AvisDTO avisDTO) {
        AvisDTO updated = avisService.updateAvis(id, avisDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ETUDIANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteAvis(@PathVariable Long id) {
        avisService.deleteAvis(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AvisDTO> getAvisById(@PathVariable Long id) {
        AvisDTO avis = avisService.getAvisById(id);
        return ResponseEntity.ok(avis);
    }
    
    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<AvisDTO>> getAvisByCours(@PathVariable Long coursId) {
        List<AvisDTO> avisList = avisService.getAvisByCours(coursId);
        return ResponseEntity.ok(avisList);
    }
    
    @GetMapping("/cours/{coursId}/moyenne")
    public ResponseEntity<Double> getAverageNote(@PathVariable Long coursId) {
        Double average = avisService.getAverageNoteByCours(coursId);
        return ResponseEntity.ok(average);
    }
    
    @GetMapping("/cours/{coursId}/count")
    public ResponseEntity<Long> countAvis(@PathVariable Long coursId) {
        Long count = avisService.countAvisByCours(coursId);
        return ResponseEntity.ok(count);
    }
}
