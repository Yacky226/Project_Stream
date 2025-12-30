package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.dto.LeconDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {RessourceMapper.class})
public interface LeconMapper {
    
    @Mapping(source = "section.id", target = "sectionId")
    @Mapping(source = "ressources", target = "ressources")
    @Mapping(target = "isCompleted", ignore = true)
    LeconDTO toDto(Lecon lecon);
    
    @Mapping(source = "sectionId", target = "section.id")
    @Mapping(target = "ressources", ignore = true)
    Lecon toEntity(LeconDTO leconDTO);
    
    List<LeconDTO> toDtoList(List<Lecon> lecons);
    
    List<Lecon> toEntityList(List<LeconDTO> leconDTOs);
}
