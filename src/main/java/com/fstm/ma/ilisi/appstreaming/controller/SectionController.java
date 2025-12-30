package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.SectionDTO;
import com.fstm.ma.ilisi.appstreaming.service.SectionServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SectionController {
    
    private final SectionServiceInterface sectionService;
    
    @PostMapping
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<SectionDTO> createSection(@Valid @RequestBody SectionDTO sectionDTO) {
        SectionDTO created = sectionService.createSection(sectionDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<SectionDTO> updateSection(@PathVariable Long id, @Valid @RequestBody SectionDTO sectionDTO) {
        SectionDTO updated = sectionService.updateSection(id, sectionDTO);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        sectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SectionDTO> getSectionById(@PathVariable Long id) {
        SectionDTO section = sectionService.getSectionById(id);
        return ResponseEntity.ok(section);
    }
    
    @GetMapping("/cours/{coursId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SectionDTO>> getSectionsByCours(@PathVariable Long coursId) {
        List<SectionDTO> sections = sectionService.getSectionsByCoursIdWithLecons(coursId);
        return ResponseEntity.ok(sections);
    }
}
