package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.Ressource;
import com.fstm.ma.ilisi.appstreaming.model.dto.RessourceDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class RessourceMapperSpringAdapter implements RessourceMapper {

    @Override
    public RessourceDTO toDto(Ressource ressource) {
        if (ressource == null) {
            return null;
        }

        RessourceDTO dto = new RessourceDTO();
        dto.setId(ressource.getId());
        dto.setTitre(ressource.getTitre());
        dto.setType(ressource.getType());
        dto.setUrl(ressource.getUrl());
        dto.setTailleFichier(ressource.getTailleFichier());

        if (ressource.getLecon() != null) {
            dto.setLeconId(ressource.getLecon().getId());
        }
        if (ressource.getCours() != null) {
            dto.setCoursId(ressource.getCours().getId());
        }

        return dto;
    }

    @Override
    public Ressource toEntity(RessourceDTO ressourceDTO) {
        if (ressourceDTO == null) {
            return null;
        }

        Ressource entity = new Ressource();
        entity.setId(ressourceDTO.getId());
        entity.setTitre(ressourceDTO.getTitre());
        entity.setType(ressourceDTO.getType());
        entity.setUrl(ressourceDTO.getUrl());
        entity.setTailleFichier(ressourceDTO.getTailleFichier());

        if (ressourceDTO.getLeconId() != null) {
            Lecon lecon = new Lecon();
            lecon.setId(ressourceDTO.getLeconId());
            entity.setLecon(lecon);
        }

        if (ressourceDTO.getCoursId() != null) {
            Cours cours = new Cours();
            cours.setId(ressourceDTO.getCoursId());
            entity.setCours(cours);
        }

        return entity;
    }

    @Override
    public List<RessourceDTO> toDtoList(List<Ressource> ressources) {
        if (ressources == null) {
            return Collections.emptyList();
        }
        return ressources.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Ressource> toEntityList(List<RessourceDTO> ressourceDTOs) {
        if (ressourceDTOs == null) {
            return Collections.emptyList();
        }
        return ressourceDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
