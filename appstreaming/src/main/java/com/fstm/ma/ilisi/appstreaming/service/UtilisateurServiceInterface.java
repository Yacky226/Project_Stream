package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;

public interface UtilisateurServiceInterface {
    UtilisateurDTO getUtilisateurParEmail(String email);
    UtilisateurDTO getUtilisateurParId(Long id);
    List<UtilisateurDTO> getTousLesUtilisateurs();
    void supprimerUtilisateur(Long id);
}