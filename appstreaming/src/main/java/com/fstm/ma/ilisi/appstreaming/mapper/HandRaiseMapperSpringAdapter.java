package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.HandRaise;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.dto.HandRaiseDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class HandRaiseMapperSpringAdapter implements HandRaiseMapper {

    @Override
    public HandRaiseDTO toDto(HandRaise handRaise) {
        if (handRaise == null) {
            return null;
        }

        HandRaiseDTO dto = new HandRaiseDTO();
        dto.setId(handRaise.getId());
        dto.setTimestampDemande(handRaise.getTimestampDemande());
        dto.setStatut(handRaise.getStatut());
        dto.setTimestampAccorde(handRaise.getTimestampAccorde());
        dto.setTimestampFin(handRaise.getTimestampFin());
        dto.setOrdre(handRaise.getOrdre());

        if (handRaise.getEtudiant() != null) {
            dto.setEtudiantId(handRaise.getEtudiant().getId());
            dto.setEtudiantNom(handRaise.getEtudiant().getNom());
            dto.setEtudiantPhoto(handRaise.getEtudiant().getPhotoProfil());
        }

        if (handRaise.getSession() != null) {
            dto.setSessionId(handRaise.getSession().getId());
        }

        return dto;
    }

    @Override
    public HandRaise toEntity(HandRaiseDTO handRaiseDTO) {
        if (handRaiseDTO == null) {
            return null;
        }

        HandRaise entity = new HandRaise();
        entity.setId(handRaiseDTO.getId());
        entity.setTimestampDemande(handRaiseDTO.getTimestampDemande());
        entity.setStatut(handRaiseDTO.getStatut());
        entity.setTimestampAccorde(handRaiseDTO.getTimestampAccorde());
        entity.setTimestampFin(handRaiseDTO.getTimestampFin());
        entity.setOrdre(handRaiseDTO.getOrdre());

        if (handRaiseDTO.getEtudiantId() != null) {
            Etudiant etudiant = new Etudiant();
            etudiant.setId(handRaiseDTO.getEtudiantId());
            entity.setEtudiant(etudiant);
        }

        if (handRaiseDTO.getSessionId() != null) {
            SessionStreaming session = new SessionStreaming();
            session.setId(handRaiseDTO.getSessionId());
            entity.setSession(session);
        }

        return entity;
    }

    @Override
    public List<HandRaiseDTO> toDtoList(List<HandRaise> handRaises) {
        if (handRaises == null) {
            return Collections.emptyList();
        }
        return handRaises.stream().map(this::toDto).collect(Collectors.toList());
    }
}
