package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.dto.SectionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {LeconMapper.class})
public interface SectionMapper {
    
    @Mapping(source = "cours.id", target = "coursId")
    @Mapping(source = "lecons", target = "lecons")
    SectionDTO toDto(Section section);
    
    @Mapping(source = "coursId", target = "cours.id")
    @Mapping(target = "lecons", ignore = true)
    Section toEntity(SectionDTO sectionDTO);
    
    List<SectionDTO> toDtoList(List<Section> sections);
    
    List<Section> toEntityList(List<SectionDTO> sectionDTOs);
}
