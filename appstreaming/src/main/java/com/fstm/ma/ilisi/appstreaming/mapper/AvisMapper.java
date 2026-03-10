package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Avis;
import com.fstm.ma.ilisi.appstreaming.model.dto.AvisDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AvisMapper {
    
    public AvisDTO toDto(Avis avis) {
        if (avis == null) return null;
        
        AvisDTO dto = new AvisDTO();
        dto.setId(avis.getId());
        dto.setNote(avis.getNote());
        dto.setCommentaire(avis.getCommentaire());
        dto.setDateCreation(avis.getDateCreation());
        dto.setDateModification(avis.getDateModification());
        
        if (avis.getEtudiant() != null) {
            dto.setEtudiantId(avis.getEtudiant().getId());
            dto.setEtudiantNom(avis.getEtudiant().getNom());
            dto.setEtudiantPhoto(avis.getEtudiant().getPhotoProfil());
        }
        
        if (avis.getCours() != null) {
            dto.setCoursId(avis.getCours().getId());
        }
        
        return dto;
    }
    
    public Avis toEntity(AvisDTO avisDTO) {
        if (avisDTO == null) return null;
        
        Avis avis = new Avis();
        avis.setId(avisDTO.getId());
        avis.setNote(avisDTO.getNote());
        avis.setCommentaire(avisDTO.getCommentaire());
        avis.setDateCreation(avisDTO.getDateCreation());
        avis.setDateModification(avisDTO.getDateModification());
        
        return avis;
    }
    
    public List<AvisDTO> toDtoList(List<Avis> avisList) {
        if (avisList == null) return null;
        return avisList.stream().map(this::toDto).collect(Collectors.toList());
    }
    
    public List<Avis> toEntityList(List<AvisDTO> avisDTOs) {
        if (avisDTOs == null) return null;
        return avisDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
