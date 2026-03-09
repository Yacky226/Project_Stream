package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;

@Service
public class UtilisateurService implements UtilisateurServiceInterface {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, UtilisateurMapper utilisateurMapper) {
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
    }

    @Override
    public UtilisateurDTO getUtilisateurParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .map(utilisateurMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Override
    public UtilisateurDTO getUtilisateurParId(Long id) {
        return utilisateurRepository.findById(id)
                .map(utilisateurMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @Override
    public List<UtilisateurDTO> getTousLesUtilisateurs() {
        return utilisateurRepository.findAll()
                .stream()
                .map(utilisateurMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void supprimerUtilisateur(Long id) {
        utilisateurRepository.deleteById(id);
    }
}


