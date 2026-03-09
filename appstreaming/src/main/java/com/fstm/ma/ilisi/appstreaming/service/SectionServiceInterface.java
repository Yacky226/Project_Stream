package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.SectionDTO;

import java.util.List;

public interface SectionServiceInterface {
    
    SectionDTO createSection(SectionDTO sectionDTO);
    
    SectionDTO updateSection(Long id, SectionDTO sectionDTO);
    
    void deleteSection(Long id);
    
    SectionDTO getSectionById(Long id);
    
    List<SectionDTO> getSectionsByCoursId(Long coursId);
    
    List<SectionDTO> getSectionsByCoursIdWithLecons(Long coursId);
}
