package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.service.AdministrateurService;
import com.fstm.ma.ilisi.appstreaming.service.EnseignantService;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdministrateurController {

    private final AdministrateurService administrateurService;
    private final EnseignantService enseignantService;
    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;

    public AdministrateurController(AdministrateurService administrateurService,
                                     EnseignantService enseignantService,
                                     UtilisateurRepository utilisateurRepository,
                                     UtilisateurMapper utilisateurMapper) {
        this.administrateurService = administrateurService;
        this.enseignantService = enseignantService;
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
    }

    //  Ajouter un nouvel administrateur
    @PostMapping("/ajouter-admin")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<AdministrateurDTO> ajouterAdministrateur(@Valid @RequestBody AdministrateurDTO dto) {
        return ResponseEntity.ok(administrateurService.ajouterAdministrateur(dto));
    }

    //  Ajouter un nouvel enseignant
    @PostMapping("/ajouter-enseignant")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<EnseignantDTO> ajouterEnseignant(@Valid @RequestBody EnseignantDTO dto) {
        return ResponseEntity.ok(enseignantService.ajouterEnseignant(dto));
    }

    //  Voir tous les utilisateurs
    @GetMapping("/utilisateurs")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<UtilisateurDTO>> getTousLesUtilisateurs() {
        List<UtilisateurDTO> utilisateurs = utilisateurRepository.findAll()
                .stream()
                .map(utilisateurMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(utilisateurs);
    }
}
