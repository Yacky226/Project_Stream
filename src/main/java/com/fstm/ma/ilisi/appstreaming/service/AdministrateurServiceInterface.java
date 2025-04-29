package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;

public interface AdministrateurServiceInterface {
	 AdministrateurDTO ajouterAdministrateur(AdministrateurDTO dto);
	 List<AdministrateurDTO> getTousLesAdministrateurs();
	 AdministrateurDTO getAdministrateurParId(Long id);
	 void supprimerAdministrateur(Long id);
	}
