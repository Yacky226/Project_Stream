package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ProgressionLeconDTO;

import java.util.List;

public interface InscriptionServiceInterface {
    
    InscriptionDTO inscrireEtudiant(Long etudiantId, Long coursId);
    
    InscriptionDTO getInscriptionById(Long id);
    
    InscriptionDTO getInscriptionByEtudiantAndCours(Long etudiantId, Long coursId);
    
    List<InscriptionDTO> getInscriptionsByEtudiant(Long etudiantId);
    
    List<InscriptionDTO> getInscriptionsByCours(Long coursId);
    
    boolean isEtudiantInscrit(Long etudiantId, Long coursId);
    
    ProgressionLeconDTO marquerLeconTerminee(Long inscriptionId, Long leconId);
    
    ProgressionLeconDTO marquerLeconNonTerminee(Long inscriptionId, Long leconId);
    
    List<ProgressionLeconDTO> getProgressionByInscription(Long inscriptionId);
    
    Double calculerProgression(Long inscriptionId);
}
