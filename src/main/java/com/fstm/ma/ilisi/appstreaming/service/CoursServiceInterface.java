package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;

public interface CoursServiceInterface {
    CoursDTO ajouterCours(CoursDTO dto);
    List<CoursDTO> getTousLesCours();
    CoursDTO getCoursParId(Long id);
    CoursDTO modifierCours(Long id, CoursDTO dto);
    void supprimerCours(Long id);
}
