package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurMapper {

    public UtilisateurDTO toDTO(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setRole(utilisateur.getRole().name());
        dto.setDateNaissance(utilisateur.getDateNaissance());
        dto.setPhotoProfil(utilisateur.getPhotoProfil());
        return dto;
    }

    public void updateEntityFromDTO(UtilisateurDTO dto, Utilisateur utilisateur) {
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setPassword(dto.getPassword());
        utilisateur.setRole(Role.valueOf(dto.getRole()));
        utilisateur.setDateNaissance(dto.getDateNaissance());
        utilisateur.setPhotoProfil(dto.getPhotoProfil());
    }
}
