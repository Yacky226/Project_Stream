package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.RessourceMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.Ressource;
import com.fstm.ma.ilisi.appstreaming.model.dto.RessourceDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.LeconRepository;
import com.fstm.ma.ilisi.appstreaming.repository.RessourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RessourceService implements RessourceServiceInterface {
    
    private final RessourceRepository ressourceRepository;
    private final LeconRepository leconRepository;
    private final CoursRepository coursRepository;
    private final RessourceMapper ressourceMapper;
    
    @Override
    public RessourceDTO createRessource(RessourceDTO ressourceDTO) {
        Ressource ressource = ressourceMapper.toEntity(ressourceDTO);
        
        if (ressourceDTO.getLeconId() != null) {
            Lecon lecon = leconRepository.findById(ressourceDTO.getLeconId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lecon not found with id: " + ressourceDTO.getLeconId()));
            ressource.setLecon(lecon);
        }
        
        if (ressourceDTO.getCoursId() != null) {
            Cours cours = coursRepository.findById(ressourceDTO.getCoursId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cours not found with id: " + ressourceDTO.getCoursId()));
            ressource.setCours(cours);
        }
        
        Ressource savedRessource = ressourceRepository.save(ressource);
        return ressourceMapper.toDto(savedRessource);
    }
    
    @Override
    public RessourceDTO updateRessource(Long id, RessourceDTO ressourceDTO) {
        Ressource existingRessource = ressourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource not found with id: " + id));
        
        existingRessource.setTitre(ressourceDTO.getTitre());
        existingRessource.setType(ressourceDTO.getType());
        existingRessource.setUrl(ressourceDTO.getUrl());
        existingRessource.setTailleFichier(ressourceDTO.getTailleFichier());
        
        Ressource updatedRessource = ressourceRepository.save(existingRessource);
        return ressourceMapper.toDto(updatedRessource);
    }
    
    @Override
    public void deleteRessource(Long id) {
        if (!ressourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ressource not found with id: " + id);
        }
        ressourceRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public RessourceDTO getRessourceById(Long id) {
        Ressource ressource = ressourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ressource not found with id: " + id));
        return ressourceMapper.toDto(ressource);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> getRessourcesByLecon(Long leconId) {
        List<Ressource> ressources = ressourceRepository.findByLeconId(leconId);
        return ressourceMapper.toDtoList(ressources);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<RessourceDTO> getRessourcesByCours(Long coursId) {
        List<Ressource> ressources = ressourceRepository.findByCoursId(coursId);
        return ressourceMapper.toDtoList(ressources);
    }
}
