package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.HandRaise;
import com.fstm.ma.ilisi.appstreaming.model.dto.HandRaiseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HandRaiseMapper {
    
    @Mapping(source = "etudiant.id", target = "etudiantId")
    @Mapping(source = "etudiant.nom", target = "etudiantNom")
    @Mapping(source = "etudiant.photoProfil", target = "etudiantPhoto")
    @Mapping(source = "session.id", target = "sessionId")
    HandRaiseDTO toDto(HandRaise handRaise);
    
    @Mapping(source = "etudiantId", target = "etudiant.id")
    @Mapping(source = "sessionId", target = "session.id")
    HandRaise toEntity(HandRaiseDTO handRaiseDTO);
    
    List<HandRaiseDTO> toDtoList(List<HandRaise> handRaises);
}
