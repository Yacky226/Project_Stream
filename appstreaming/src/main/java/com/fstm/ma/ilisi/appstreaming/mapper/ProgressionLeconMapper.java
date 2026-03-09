package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.ProgressionLecon;
import com.fstm.ma.ilisi.appstreaming.model.dto.ProgressionLeconDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProgressionLeconMapper {
    
    @Mapping(source = "inscription.id", target = "inscriptionId")
    @Mapping(source = "id.leconId", target = "leconId")
    @Mapping(source = "lecon.titre", target = "leconTitre")
    ProgressionLeconDTO toDto(ProgressionLecon progressionLecon);
    
    @Mapping(source = "inscriptionId", target = "inscription.id")
    @Mapping(source = "leconId", target = "id.leconId")
    @Mapping(target = "lecon", ignore = true)
    ProgressionLecon toEntity(ProgressionLeconDTO progressionLeconDTO);
    
    List<ProgressionLeconDTO> toDtoList(List<ProgressionLecon> progressionLecons);
    
    List<ProgressionLecon> toEntityList(List<ProgressionLeconDTO> progressionLeconDTOs);
}
