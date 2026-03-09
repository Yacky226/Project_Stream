package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;

@Component
public class CoursMapper {

    public CoursDTO toDTO(Cours cours) {
        CoursDTO dto = new CoursDTO();
        dto.setId(cours.getId());
        dto.setTitre(cours.getTitre());
        dto.setDescription(cours.getDescription());
        dto.setCategorie(cours.getCategorie());
        dto.setHoraire(cours.getHoraire());
        dto.setEnseignantId(cours.getEnseignant().getId());
        return dto;
    }

    public Cours toEntity(CoursDTO dto, Enseignant enseignant) {
        Cours cours = new Cours();
        cours.setId(dto.getId());
        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setCategorie(dto.getCategorie());
        cours.setHoraire(dto.getHoraire());
        cours.setEnseignant(enseignant);
        return cours;
    }
}
