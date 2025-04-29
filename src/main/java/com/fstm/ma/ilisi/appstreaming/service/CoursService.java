package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.CoursMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;

@Service
public class CoursService implements CoursServiceInterface {

    private final CoursRepository coursRepository;
    private final EnseignantRepository enseignantRepository;
    private final CoursMapper coursMapper;

    public CoursService(CoursRepository coursRepo, EnseignantRepository enseignantRepo, CoursMapper mapper) {
        this.coursRepository = coursRepo;
        this.enseignantRepository = enseignantRepo;
        this.coursMapper = mapper;
    }

    @Override
    public CoursDTO ajouterCours(CoursDTO dto) {
        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        Cours cours = coursMapper.toEntity(dto, enseignant);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    public List<CoursDTO> getTousLesCours() {
        return coursRepository.findAll()
                .stream()
                .map(coursMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CoursDTO getCoursParId(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        return coursMapper.toDTO(cours);
    }

    @Override
    public CoursDTO modifierCours(Long id, CoursDTO dto) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));

        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setCategorie(dto.getCategorie());
        cours.setHoraire(dto.getHoraire());
        cours.setEnseignant(enseignant);

        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    public void supprimerCours(Long id) {
        coursRepository.deleteById(id);
    }
}
