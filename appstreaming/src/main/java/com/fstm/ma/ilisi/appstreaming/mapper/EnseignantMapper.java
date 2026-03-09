package com.fstm.ma.ilisi.appstreaming.mapper;

import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;

@Component
public class EnseignantMapper {

	public EnseignantDTO toDTO(Enseignant enseignant) {
	    if (enseignant == null) {
	        return null;
	    }

	    EnseignantDTO dto = new EnseignantDTO();
	    dto.setId(enseignant.getId());
	    dto.setNom(enseignant.getNom());
	    dto.setEmail(enseignant.getEmail());
	    dto.setPassword(enseignant.getPassword());
	    dto.setRole(enseignant.getRole().name());
	    dto.setSpecialite(enseignant.getSpecialite());

	   
	    if (enseignant.getCours() != null) {
	        dto.setCoursIds(
	            enseignant.getCours()
	                      .stream()
	                      .map(c -> c.getId())
	                      .collect(Collectors.toList())
	        );
	    }

	    return dto;
	}

    public Enseignant toEntity(EnseignantDTO dto) {
        Enseignant enseignant = new Enseignant();
        enseignant.setId(dto.getId());
        enseignant.setNom(dto.getNom());
        enseignant.setEmail(dto.getEmail());
        enseignant.setPassword(dto.getPassword());
        enseignant.setRole(Role.valueOf(dto.getRole()));
        enseignant.setSpecialite(dto.getSpecialite());
        return enseignant;
    }
}
