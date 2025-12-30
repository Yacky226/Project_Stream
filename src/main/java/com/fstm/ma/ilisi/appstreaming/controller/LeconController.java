package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.LeconDTO;
import com.fstm.ma.ilisi.appstreaming.service.LeconServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lecons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeconController {
    
    private final LeconServiceInterface leconService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<LeconDTO> createLecon(@Valid @RequestBody LeconDTO leconDTO) {
        LeconDTO created = leconService.createLecon(leconDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<LeconDTO> updateLecon(@PathVariable Long id, @Valid @RequestBody LeconDTO leconDTO) {
        LeconDTO updated = leconService.updateLecon(id, leconDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteLecon(@PathVariable Long id) {
        leconService.deleteLecon(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeconDTO> getLeconById(@PathVariable Long id) {
        LeconDTO lecon = leconService.getLeconById(id);
        return ResponseEntity.ok(lecon);
    }
    
    @GetMapping("/section/{sectionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeconDTO>> getLeconsBySection(@PathVariable Long sectionId) {
        List<LeconDTO> lecons = leconService.getLeconsBySectionId(sectionId);
        return ResponseEntity.ok(lecons);
    }
    
    @GetMapping("/cours/{coursId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeconDTO>> getLeconsByCours(@PathVariable Long coursId) {
        List<LeconDTO> lecons = leconService.getLeconsByCoursId(coursId);
        return ResponseEntity.ok(lecons);
    }
}
