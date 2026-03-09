package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.LeconMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.dto.LeconDTO;
import com.fstm.ma.ilisi.appstreaming.repository.LeconRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LeconService implements LeconServiceInterface {
    
    private final LeconRepository leconRepository;
    private final SectionRepository sectionRepository;
    private final LeconMapper leconMapper;
    
    @Override
    public LeconDTO createLecon(LeconDTO leconDTO) {
        Section section = sectionRepository.findById(leconDTO.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + leconDTO.getSectionId()));
        
        Lecon lecon = leconMapper.toEntity(leconDTO);
        lecon.setSection(section);
        
        Lecon savedLecon = leconRepository.save(lecon);
        return leconMapper.toDto(savedLecon);
    }
    
    @Override
    public LeconDTO updateLecon(Long id, LeconDTO leconDTO) {
        Lecon existingLecon = leconRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecon not found with id: " + id));
        
        existingLecon.setTitre(leconDTO.getTitre());
        existingLecon.setDescription(leconDTO.getDescription());
        existingLecon.setType(leconDTO.getType());
        existingLecon.setContenuUrl(leconDTO.getContenuUrl());
        existingLecon.setContenuTexte(leconDTO.getContenuTexte());
        existingLecon.setDureeMinutes(leconDTO.getDureeMinutes());
        existingLecon.setOrdre(leconDTO.getOrdre());
        
        Lecon updatedLecon = leconRepository.save(existingLecon);
        return leconMapper.toDto(updatedLecon);
    }
    
    @Override
    public void deleteLecon(Long id) {
        if (!leconRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lecon not found with id: " + id);
        }
        leconRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public LeconDTO getLeconById(Long id) {
        Lecon lecon = leconRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecon not found with id: " + id));
        return leconMapper.toDto(lecon);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeconDTO> getLeconsBySectionId(Long sectionId) {
        List<Lecon> lecons = leconRepository.findBySectionIdOrderByOrdreAsc(sectionId);
        return leconMapper.toDtoList(lecons);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeconDTO> getLeconsByCoursId(Long coursId) {
        List<Lecon> lecons = leconRepository.findByCoursId(coursId);
        return leconMapper.toDtoList(lecons);
    }
}
