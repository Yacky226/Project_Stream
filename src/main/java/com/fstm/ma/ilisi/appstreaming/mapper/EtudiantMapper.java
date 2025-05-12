package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.model.dto.EtudiantDTO;

@Component
public class EtudiantMapper {

    public EtudiantDTO toDTO(Etudiant etudiant) {
        EtudiantDTO dto = new EtudiantDTO();
        dto.setId(etudiant.getId());
        dto.setNom(etudiant.getNom());
        dto.setEmail(etudiant.getEmail());
        dto.setPassword(etudiant.getPassword());
        dto.setRole(etudiant.getRole().name());
        dto.setNiveau(etudiant.getNiveau());
        dto.setDateNaissance(etudiant.getDateNaissance());
        dto.setPhotoProfil(etudiant.getPhotoProfil());
        return dto;
    }

    public Etudiant toEntity(EtudiantDTO dto) {
        Etudiant etudiant = new Etudiant();
        etudiant.setId(dto.getId());
        etudiant.setNom(dto.getNom());
        etudiant.setEmail(dto.getEmail());
        etudiant.setPassword(dto.getPassword());
        etudiant.setRole(Role.valueOf(dto.getRole()));
        etudiant.setNiveau(dto.getNiveau());
        etudiant.setDateNaissance(dto.getDateNaissance());
        etudiant.setPhotoProfil(dto.getPhotoProfil());
        return etudiant;
    }
}
