package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.dto.SectionDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class SectionMapperSpringAdapter implements SectionMapper {

    private final LeconMapper leconMapper;

    public SectionMapperSpringAdapter(LeconMapper leconMapper) {
        this.leconMapper = leconMapper;
    }

    @Override
    public SectionDTO toDto(Section section) {
        if (section == null) {
            return null;
        }

        SectionDTO dto = new SectionDTO();
        dto.setId(section.getId());
        dto.setTitre(section.getTitre());
        dto.setDescription(section.getDescription());
        dto.setOrdre(section.getOrdre());

        if (section.getCours() != null) {
            dto.setCoursId(section.getCours().getId());
        }

        dto.setLecons(leconMapper.toDtoList(section.getLecons()));
        return dto;
    }

    @Override
    public Section toEntity(SectionDTO sectionDTO) {
        if (sectionDTO == null) {
            return null;
        }

        Section entity = new Section();
        entity.setId(sectionDTO.getId());
        entity.setTitre(sectionDTO.getTitre());
        entity.setDescription(sectionDTO.getDescription());
        entity.setOrdre(sectionDTO.getOrdre());

        if (sectionDTO.getCoursId() != null) {
            Cours cours = new Cours();
            cours.setId(sectionDTO.getCoursId());
            entity.setCours(cours);
        }

        return entity;
    }

    @Override
    public List<SectionDTO> toDtoList(List<Section> sections) {
        if (sections == null) {
            return Collections.emptyList();
        }
        return sections.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Section> toEntityList(List<SectionDTO> sectionDTOs) {
        if (sectionDTOs == null) {
            return Collections.emptyList();
        }
        return sectionDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
