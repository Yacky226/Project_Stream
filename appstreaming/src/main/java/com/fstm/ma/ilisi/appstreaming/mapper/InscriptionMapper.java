package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InscriptionMapper {
    
    @Mapping(source = "etudiant.id", target = "etudiantId")
    @Mapping(source = "etudiant.nom", target = "etudiantNom")
    @Mapping(source = "cours.id", target = "coursId")
    @Mapping(source = "cours.titre", target = "coursTitre")
    InscriptionDTO toDto(Inscription inscription);
    
    @Mapping(source = "etudiantId", target = "etudiant.id")
    @Mapping(source = "coursId", target = "cours.id")
    @Mapping(target = "progressionLecons", ignore = true)
    Inscription toEntity(InscriptionDTO inscriptionDTO);
    
    List<InscriptionDTO> toDtoList(List<Inscription> inscriptions);
    
    List<Inscription> toEntityList(List<InscriptionDTO> inscriptionDTOs);
}
