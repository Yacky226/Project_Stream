package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.AvisDTO;

import java.util.List;

public interface AvisServiceInterface {
    
    AvisDTO creerAvis(AvisDTO avisDTO);
    
    AvisDTO updateAvis(Long id, AvisDTO avisDTO);
    
    void deleteAvis(Long id);
    
    AvisDTO getAvisById(Long id);
    
    List<AvisDTO> getAvisByCours(Long coursId);
    
    AvisDTO getAvisByEtudiantAndCours(Long etudiantId, Long coursId);
    
    Double getAverageNoteByCours(Long coursId);
    
    Long countAvisByCours(Long coursId);
}
