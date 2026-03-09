package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.RessourceDTO;

import java.util.List;

public interface RessourceServiceInterface {
    
    RessourceDTO createRessource(RessourceDTO ressourceDTO);
    
    RessourceDTO updateRessource(Long id, RessourceDTO ressourceDTO);
    
    void deleteRessource(Long id);
    
    RessourceDTO getRessourceById(Long id);
    
    List<RessourceDTO> getRessourcesByLecon(Long leconId);
    
    List<RessourceDTO> getRessourcesByCours(Long coursId);
}
