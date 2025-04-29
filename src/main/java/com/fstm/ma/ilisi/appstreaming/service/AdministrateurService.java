package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Administrateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.AdministrateurRepository;

@Service
public class AdministrateurService implements AdministrateurServiceInterface {

 private final AdministrateurRepository administrateurRepository;
 private final UtilisateurMapper utilisateurMapper;
 private final PasswordEncoder passwordEncoder;

 public AdministrateurService(AdministrateurRepository administrateurRepository,
		 UtilisateurMapper utilisateurMapper,PasswordEncoder passwordEncoder
		 ) {
     this.administrateurRepository = administrateurRepository;
     this.utilisateurMapper = utilisateurMapper;
     this.passwordEncoder=passwordEncoder;
 }

 @Override
 public AdministrateurDTO ajouterAdministrateur(AdministrateurDTO dto) {
     Administrateur admin = new Administrateur();
     utilisateurMapper.updateEntityFromDTO(dto, admin);
     admin.setPassword(passwordEncoder.encode(dto.getPassword()));
     return (AdministrateurDTO) utilisateurMapper.toDTO(administrateurRepository.save(admin));
 }

 @Override
 public List<AdministrateurDTO> getTousLesAdministrateurs() {
     return administrateurRepository.findAll()
             .stream()
             .map(admin -> (AdministrateurDTO) utilisateurMapper.toDTO(admin))
             .collect(Collectors.toList());
 }

 @Override
 public AdministrateurDTO getAdministrateurParId(Long id) {
     return administrateurRepository.findById(id)
             .map(admin -> (AdministrateurDTO) utilisateurMapper.toDTO(admin))
             .orElseThrow(() -> new RuntimeException("Administrateur non trouvé"));
 }

 @Override
 public void supprimerAdministrateur(Long id) {
     administrateurRepository.deleteById(id);
 }
}

