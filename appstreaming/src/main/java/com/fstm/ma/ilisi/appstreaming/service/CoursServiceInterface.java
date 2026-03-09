package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDetailsDTO;

public interface CoursServiceInterface {
    CoursDTO ajouterCours(CoursDTO dto);
    List<CoursDTO> getTousLesCours();
    CoursDTO getCoursParId(Long id);
    CoursDetailsDTO getCoursDetailsById(Long id, Long etudiantId);
    CoursDTO modifierCours(Long id, CoursDTO dto);
    void supprimerCours(Long id);
}
