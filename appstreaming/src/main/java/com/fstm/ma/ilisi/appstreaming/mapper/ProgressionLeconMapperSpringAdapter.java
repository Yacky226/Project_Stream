package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.ProgressionLecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.ProgressionLeconId;
import com.fstm.ma.ilisi.appstreaming.model.dto.ProgressionLeconDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class ProgressionLeconMapperSpringAdapter implements ProgressionLeconMapper {

    @Override
    public ProgressionLeconDTO toDto(ProgressionLecon progressionLecon) {
        if (progressionLecon == null) {
            return null;
        }

        ProgressionLeconDTO dto = new ProgressionLeconDTO();

        if (progressionLecon.getInscription() != null) {
            dto.setInscriptionId(progressionLecon.getInscription().getId());
        } else if (progressionLecon.getId() != null) {
            dto.setInscriptionId(progressionLecon.getId().getInscriptionId());
        }

        if (progressionLecon.getId() != null) {
            dto.setLeconId(progressionLecon.getId().getLeconId());
        }

        if (progressionLecon.getLecon() != null) {
            dto.setLeconTitre(progressionLecon.getLecon().getTitre());
        }

        dto.setTermine(progressionLecon.getTermine());
        dto.setDateCompletion(progressionLecon.getDateCompletion());

        return dto;
    }

    @Override
    public ProgressionLecon toEntity(ProgressionLeconDTO progressionLeconDTO) {
        if (progressionLeconDTO == null) {
            return null;
        }

        ProgressionLecon entity = new ProgressionLecon();

        if (progressionLeconDTO.getInscriptionId() != null || progressionLeconDTO.getLeconId() != null) {
            entity.setId(new ProgressionLeconId(
                    progressionLeconDTO.getInscriptionId(),
                    progressionLeconDTO.getLeconId()
            ));
        }

        if (progressionLeconDTO.getInscriptionId() != null) {
            Inscription inscription = new Inscription();
            inscription.setId(progressionLeconDTO.getInscriptionId());
            entity.setInscription(inscription);
        }

        entity.setTermine(progressionLeconDTO.getTermine());
        entity.setDateCompletion(progressionLeconDTO.getDateCompletion());
        return entity;
    }

    @Override
    public List<ProgressionLeconDTO> toDtoList(List<ProgressionLecon> progressionLecons) {
        if (progressionLecons == null) {
            return Collections.emptyList();
        }
        return progressionLecons.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<ProgressionLecon> toEntityList(List<ProgressionLeconDTO> progressionLeconDTOs) {
        if (progressionLeconDTOs == null) {
            return Collections.emptyList();
        }
        return progressionLeconDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
