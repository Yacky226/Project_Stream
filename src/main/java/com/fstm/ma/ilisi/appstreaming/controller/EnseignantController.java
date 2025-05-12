package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.CoursMapper;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enseignant")
public class EnseignantController {

    private final UtilisateurRepository utilisateurRepository;
    private final EnseignantRepository enseignantRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final CoursMapper coursMapper;

    public EnseignantController(UtilisateurRepository utilisateurRepository, 
                                 EnseignantRepository enseignantRepository,
                                 UtilisateurMapper utilisateurMapper,
                                 CoursMapper coursMapper) {
        this.utilisateurRepository = utilisateurRepository;
        this.enseignantRepository = enseignantRepository;
        this.utilisateurMapper = utilisateurMapper;
        this.coursMapper = coursMapper;
    }

    //  Voir profil enseignant
    @GetMapping("/profil")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<UtilisateurDTO> getProfil(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(utilisateurMapper.toDTO(utilisateur));
    }

    // Voir tous ses cours
    @GetMapping("/mes-cours")
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    public ResponseEntity<List<CoursDTO>> getMesCours(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Enseignant enseignant = enseignantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        List<CoursDTO> coursList = enseignant.getCours()
                .stream()
                .map(coursMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(coursList);
    }
    @PreAuthorize("hasAuthority('ENSEIGNANT')")
    @GetMapping("/specialite")
    public ResponseEntity<String> getNiveau(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        Enseignant enseignant = enseignantRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("enseignant non trouvé avec email : " + email));

        return ResponseEntity.ok(enseignant.getSpecialite());
    }
}
