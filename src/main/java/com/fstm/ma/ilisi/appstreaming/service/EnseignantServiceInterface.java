package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;

public interface EnseignantServiceInterface {
	 EnseignantDTO ajouterEnseignant(EnseignantDTO dto);
	 List<EnseignantDTO> getTousLesEnseignants();
	 EnseignantDTO getEnseignantParId(Long id);
	 void supprimerEnseignant(Long id);
	}
