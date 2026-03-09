package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.SectionMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.dto.SectionDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SectionService implements SectionServiceInterface {
    
    private final SectionRepository sectionRepository;
    private final CoursRepository coursRepository;
    private final SectionMapper sectionMapper;
    
    @Override
    public SectionDTO createSection(SectionDTO sectionDTO) {
        Cours cours = coursRepository.findById(sectionDTO.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours not found with id: " + sectionDTO.getCoursId()));
        
        Section section = sectionMapper.toEntity(sectionDTO);
        section.setCours(cours);
        
        Section savedSection = sectionRepository.save(section);
        return sectionMapper.toDto(savedSection);
    }
    
    @Override
    public SectionDTO updateSection(Long id, SectionDTO sectionDTO) {
        Section existingSection = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
        
        existingSection.setTitre(sectionDTO.getTitre());
        existingSection.setDescription(sectionDTO.getDescription());
        existingSection.setOrdre(sectionDTO.getOrdre());
        
        Section updatedSection = sectionRepository.save(existingSection);
        return sectionMapper.toDto(updatedSection);
    }
    
    @Override
    public void deleteSection(Long id) {
        if (!sectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Section not found with id: " + id);
        }
        sectionRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public SectionDTO getSectionById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + id));
        return sectionMapper.toDto(section);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SectionDTO> getSectionsByCoursId(Long coursId) {
        List<Section> sections = sectionRepository.findByCoursIdOrderByOrdreAsc(coursId);
        return sectionMapper.toDtoList(sections);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SectionDTO> getSectionsByCoursIdWithLecons(Long coursId) {
        List<Section> sections = sectionRepository.findByCoursIdWithLecons(coursId);
        return sectionMapper.toDtoList(sections);
    }
}
