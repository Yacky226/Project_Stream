package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.model.bo.Administrateur;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.EtudiantDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurMapper {

    public UtilisateurDTO toDTO(Utilisateur utilisateur) {
        Utilisateur resolved = resolveUtilisateur(utilisateur);
        UtilisateurDTO dto;

        if (resolved instanceof Enseignant enseignant) {
            EnseignantDTO enseignantDTO = new EnseignantDTO();
            enseignantDTO.setSpecialite(enseignant.getSpecialite());
            if (enseignant.getCours() != null) {
                enseignantDTO.setCoursIds(
                        enseignant.getCours().stream()
                                .map(cours -> cours.getId())
                                .toList()
                );
            }
            dto = enseignantDTO;
        } else if (resolved instanceof Etudiant etudiant) {
            EtudiantDTO etudiantDTO = new EtudiantDTO();
            etudiantDTO.setNiveau(etudiant.getNiveau());
            dto = etudiantDTO;
        } else if (resolved instanceof Administrateur) {
            dto = new AdministrateurDTO();
        } else {
            dto = new UtilisateurDTO();
        }

        dto.setId(resolved.getId());
        dto.setNom(resolved.getNom());
        dto.setPrenom(resolved.getPrenom());
        dto.setEmail(resolved.getEmail());
        dto.setRole(resolved.getRole().name());
        dto.setDateNaissance(resolved.getDateNaissance());
        dto.setPhotoProfil(resolved.getPhotoProfil());
        return dto;
    }

    private Utilisateur resolveUtilisateur(Utilisateur utilisateur) {
        Object unproxied = Hibernate.unproxy(utilisateur);
        if (unproxied instanceof Utilisateur resolved) {
            return resolved;
        }
        return utilisateur;
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
