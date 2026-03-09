package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.EnseignantMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;

@Service
public class EnseignantService implements EnseignantServiceInterface {

    private final EnseignantRepository enseignantRepository;
    private final EnseignantMapper enseignantMapper;
    private final PasswordEncoder passwordEncoder;

    public EnseignantService(EnseignantRepository enseignantRepository,
                              EnseignantMapper enseignantMapper,
                              PasswordEncoder passwordEncoder) {
        this.enseignantRepository = enseignantRepository;
        this.enseignantMapper = enseignantMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public EnseignantDTO ajouterEnseignant(EnseignantDTO dto) {
        Enseignant e = enseignantMapper.toEntity(dto);
        e.setPassword(passwordEncoder.encode(dto.getPassword()));
        return enseignantMapper.toDTO(enseignantRepository.save(e));
    }

    @Override
    public List<EnseignantDTO> getTousLesEnseignants() {
        return enseignantRepository.findAll()
                .stream()
                .map(enseignantMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EnseignantDTO getEnseignantParId(Long id) {
        return enseignantRepository.findById(id)
                .map(enseignantMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
    }

    @Override
    public void supprimerEnseignant(Long id) {
        enseignantRepository.deleteById(id);
    }
}
