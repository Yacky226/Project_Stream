package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Avis;
import com.fstm.ma.ilisi.appstreaming.model.dto.AvisDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AvisMapper {
    
    @Mapping(source = "etudiant.id", target = "etudiantId")
    @Mapping(source = "etudiant.nom", target = "etudiantNom")
    @Mapping(source = "etudiant.photoProfil", target = "etudiantPhoto")
    @Mapping(source = "cours.id", target = "coursId")
    AvisDTO toDto(Avis avis);
    
    @Mapping(source = "etudiantId", target = "etudiant.id")
    @Mapping(source = "coursId", target = "cours.id")
    Avis toEntity(AvisDTO avisDTO);
    
    List<AvisDTO> toDtoList(List<Avis> avisList);
    
    List<Avis> toEntityList(List<AvisDTO> avisDTOs);
}
