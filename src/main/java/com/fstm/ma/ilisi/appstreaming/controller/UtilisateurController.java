package com.fstm.ma.ilisi.appstreaming.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {
	
	private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    
    
    public UtilisateurController(UtilisateurRepository utilisateurRepository, UtilisateurMapper utilisateurMapper) {
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
      
    }
    
	
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

}
