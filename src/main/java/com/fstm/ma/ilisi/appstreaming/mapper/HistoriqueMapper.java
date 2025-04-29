package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Historique;
import com.fstm.ma.ilisi.appstreaming.model.dto.HistoriqueDTO;

@Component
public class HistoriqueMapper {

    public HistoriqueDTO toDTO(Historique h) {
        HistoriqueDTO dto = new HistoriqueDTO();
        dto.setId(h.getId());
        dto.setDateVisionnage(h.getDateVisionnage());
        dto.setEtudiantId(h.getEtudiant().getId());
        dto.setCoursId(h.getCours().getId());
        return dto;
    }

    public Historique toEntity(HistoriqueDTO dto, Etudiant etudiant, Cours cours) {
        Historique h = new Historique();
        h.setId(dto.getId());
        h.setDateVisionnage(dto.getDateVisionnage());
        h.setEtudiant(etudiant);
        h.setCours(cours);
        return h;
    }
}
