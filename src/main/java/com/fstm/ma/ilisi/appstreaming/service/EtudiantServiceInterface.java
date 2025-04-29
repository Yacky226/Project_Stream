package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.EtudiantDTO;

public interface EtudiantServiceInterface {
	 EtudiantDTO ajouterEtudiant(EtudiantDTO dto);
	 List<EtudiantDTO> getTousLesEtudiants();
	 EtudiantDTO getEtudiantParId(Long id);
	 void supprimerEtudiant(Long id);
	}