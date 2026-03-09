package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.LeconDTO;

import java.util.List;

public interface LeconServiceInterface {
    
    LeconDTO createLecon(LeconDTO leconDTO);
    
    LeconDTO updateLecon(Long id, LeconDTO leconDTO);
    
    void deleteLecon(Long id);
    
    LeconDTO getLeconById(Long id);
    
    List<LeconDTO> getLeconsBySectionId(Long sectionId);
    
    List<LeconDTO> getLeconsByCoursId(Long coursId);
}
