package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.HistoriqueDTO;

public interface HistoriqueServiceInterface {
    HistoriqueDTO enregistrerVisionnage(HistoriqueDTO dto);
    List<HistoriqueDTO> getHistoriqueParEtudiant(Long etudiantId);
}
