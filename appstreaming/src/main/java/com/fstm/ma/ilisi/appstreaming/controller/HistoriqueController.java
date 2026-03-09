package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.HistoriqueDTO;
import com.fstm.ma.ilisi.appstreaming.service.HistoriqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/historique")
public class HistoriqueController {

    private final HistoriqueService historiqueService;

    public HistoriqueController(HistoriqueService historiqueService) {
        this.historiqueService = historiqueService;
    }

    //  Enregistrer une participation (visionnage)
    @PreAuthorize("hasAuthority('ETUDIANT')")
    @PostMapping
    public ResponseEntity<HistoriqueDTO> enregistrerVisionnage(@Valid @RequestBody HistoriqueDTO dto) {
        return ResponseEntity.ok(historiqueService.enregistrerVisionnage(dto));
    }

    // Voir mon historique de participations
    @GetMapping
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<List<HistoriqueDTO>> getMonHistorique(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        return ResponseEntity.ok(historiqueService.getHistoriqueParEtudiantEmail(email));
    }

}
