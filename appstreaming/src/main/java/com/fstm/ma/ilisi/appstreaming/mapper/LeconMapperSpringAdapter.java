package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.dto.LeconDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class LeconMapperSpringAdapter implements LeconMapper {

    private final RessourceMapper ressourceMapper;

    public LeconMapperSpringAdapter(RessourceMapper ressourceMapper) {
        this.ressourceMapper = ressourceMapper;
    }

    @Override
    public LeconDTO toDto(Lecon lecon) {
        if (lecon == null) {
            return null;
        }

        LeconDTO dto = new LeconDTO();
        dto.setId(lecon.getId());
        dto.setTitre(lecon.getTitre());
        dto.setDescription(lecon.getDescription());
        dto.setType(lecon.getType());
        dto.setContenuUrl(lecon.getContenuUrl());
        dto.setContenuTexte(lecon.getContenuTexte());
        dto.setDureeMinutes(lecon.getDureeMinutes());
        dto.setOrdre(lecon.getOrdre());
        dto.setIsCompleted(null);

        if (lecon.getSection() != null) {
            dto.setSectionId(lecon.getSection().getId());
        }

        dto.setRessources(ressourceMapper.toDtoList(lecon.getRessources()));
        return dto;
    }

    @Override
    public Lecon toEntity(LeconDTO leconDTO) {
        if (leconDTO == null) {
            return null;
        }

        Lecon entity = new Lecon();
        entity.setId(leconDTO.getId());
        entity.setTitre(leconDTO.getTitre());
        entity.setDescription(leconDTO.getDescription());
        entity.setType(leconDTO.getType());
        entity.setContenuUrl(leconDTO.getContenuUrl());
        entity.setContenuTexte(leconDTO.getContenuTexte());
        entity.setDureeMinutes(leconDTO.getDureeMinutes());
        entity.setOrdre(leconDTO.getOrdre());

        if (leconDTO.getSectionId() != null) {
            Section section = new Section();
            section.setId(leconDTO.getSectionId());
            entity.setSection(section);
        }

        return entity;
    }

    @Override
    public List<LeconDTO> toDtoList(List<Lecon> lecons) {
        if (lecons == null) {
            return Collections.emptyList();
        }
        return lecons.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Lecon> toEntityList(List<LeconDTO> leconDTOs) {
        if (leconDTOs == null) {
            return Collections.emptyList();
        }
        return leconDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
