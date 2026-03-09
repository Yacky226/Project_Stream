package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.EtudiantMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.dto.EtudiantDTO;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class EtudiantService implements EtudiantServiceInterface {

 private final EtudiantRepository etudiantRepository;
 private final EtudiantMapper etudiantMapper;
 private final PasswordEncoder passwordEncoder;

 public EtudiantService(EtudiantRepository etudiantRepository, 
		 EtudiantMapper etudiantMapper,PasswordEncoder passwordEncoder) {
     this.etudiantRepository = etudiantRepository;
     this.etudiantMapper = etudiantMapper;
     this.passwordEncoder=passwordEncoder;
 }

 @Override
 public EtudiantDTO ajouterEtudiant(EtudiantDTO dto) {
     Etudiant e = etudiantMapper.toEntity(dto);
     e.setPassword(passwordEncoder.encode(dto.getPassword()));
     return etudiantMapper.toDTO(etudiantRepository.save(e));
 }

 @Override
 public List<EtudiantDTO> getTousLesEtudiants() {
     return etudiantRepository.findAll()
             .stream().map(etudiantMapper::toDTO)
             .collect(Collectors.toList());
 }

 @Override
 public EtudiantDTO getEtudiantParId(Long id) {
     return etudiantRepository.findById(id)
             .map(etudiantMapper::toDTO)
             .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
 }

 @Override
 public void supprimerEtudiant(Long id) {
     etudiantRepository.deleteById(id);
 }
}