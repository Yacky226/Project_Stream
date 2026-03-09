package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Ressource;
import com.fstm.ma.ilisi.appstreaming.model.dto.RessourceDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RessourceMapper {
    
    @Mapping(source = "lecon.id", target = "leconId")
    @Mapping(source = "cours.id", target = "coursId")
    RessourceDTO toDto(Ressource ressource);
    
    @Mapping(source = "leconId", target = "lecon.id")
    @Mapping(source = "coursId", target = "cours.id")
    Ressource toEntity(RessourceDTO ressourceDTO);
    
    List<RessourceDTO> toDtoList(List<Ressource> ressources);
    
    List<Ressource> toEntityList(List<RessourceDTO> ressourceDTOs);
}
