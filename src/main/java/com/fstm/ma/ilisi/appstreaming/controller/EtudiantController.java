package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException; 

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/etudiant")
public class EtudiantController {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final EtudiantRepository etudiantRepository;
    
    
    public EtudiantController(UtilisateurRepository utilisateurRepository, UtilisateurMapper utilisateurMapper,
    		EtudiantRepository etudiantRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
        this.etudiantRepository=etudiantRepository;
    }

    @PreAuthorize("hasAuthority('ETUDIANT')") //  Seulement pour les étudiants
    @GetMapping("/profil")
    public ResponseEntity<Map<String, Object>> getProfil(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email : " + email));

        UtilisateurDTO utilisateurDTO = utilisateurMapper.toDTO(utilisateur);

        // Créer une réponse structurée
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", utilisateurDTO);

        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @GetMapping("/niveau")
    public ResponseEntity<String> getNiveau(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();

        Etudiant etudiant = etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec email : " + email));
        
        return ResponseEntity.ok(etudiant.getNiveau());
    }
}
