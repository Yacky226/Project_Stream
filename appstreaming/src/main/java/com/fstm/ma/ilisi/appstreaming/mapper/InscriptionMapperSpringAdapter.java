package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class InscriptionMapperSpringAdapter implements InscriptionMapper {

    @Override
    public InscriptionDTO toDto(Inscription inscription) {
        if (inscription == null) {
            return null;
        }

        InscriptionDTO dto = new InscriptionDTO();
        dto.setId(inscription.getId());
        dto.setDateInscription(inscription.getDateInscription());
        dto.setStatut(inscription.getStatut());
        dto.setProgression(inscription.getProgression());
        dto.setDateCompletion(inscription.getDateCompletion());

        if (inscription.getEtudiant() != null) {
            dto.setEtudiantId(inscription.getEtudiant().getId());
            dto.setEtudiantNom(inscription.getEtudiant().getNom());
        }

        if (inscription.getCours() != null) {
            dto.setCoursId(inscription.getCours().getId());
            dto.setCoursTitre(inscription.getCours().getTitre());
        }

        return dto;
    }

    @Override
    public Inscription toEntity(InscriptionDTO inscriptionDTO) {
        if (inscriptionDTO == null) {
            return null;
        }

        Inscription entity = new Inscription();
        entity.setId(inscriptionDTO.getId());
        entity.setDateInscription(inscriptionDTO.getDateInscription());
        entity.setStatut(inscriptionDTO.getStatut());
        entity.setProgression(inscriptionDTO.getProgression());
        entity.setDateCompletion(inscriptionDTO.getDateCompletion());

        if (inscriptionDTO.getEtudiantId() != null) {
            Etudiant etudiant = new Etudiant();
            etudiant.setId(inscriptionDTO.getEtudiantId());
            entity.setEtudiant(etudiant);
        }

        if (inscriptionDTO.getCoursId() != null) {
            Cours cours = new Cours();
            cours.setId(inscriptionDTO.getCoursId());
            entity.setCours(cours);
        }

        return entity;
    }

    @Override
    public List<InscriptionDTO> toDtoList(List<Inscription> inscriptions) {
        if (inscriptions == null) {
            return Collections.emptyList();
        }
        return inscriptions.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Inscription> toEntityList(List<InscriptionDTO> inscriptionDTOs) {
        if (inscriptionDTOs == null) {
            return Collections.emptyList();
        }
        return inscriptionDTOs.stream().map(this::toEntity).collect(Collectors.toList());
    }
}
