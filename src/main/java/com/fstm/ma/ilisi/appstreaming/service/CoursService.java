package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fstm.ma.ilisi.appstreaming.mapper.CoursMapper;
import com.fstm.ma.ilisi.appstreaming.mapper.SectionMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDetailsDTO;
import com.fstm.ma.ilisi.appstreaming.repository.AvisRepository;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SectionRepository;

@Service
@Transactional
public class CoursService implements CoursServiceInterface {

    private final CoursRepository coursRepository;
    private final EnseignantRepository enseignantRepository;
    private final SectionRepository sectionRepository;
    private final InscriptionRepository inscriptionRepository;
    private final AvisRepository avisRepository;
    private final CoursMapper coursMapper;
    private final SectionMapper sectionMapper;

    public CoursService(CoursRepository coursRepo, EnseignantRepository enseignantRepo, 
                        SectionRepository sectionRepo, InscriptionRepository inscriptionRepo,
                        AvisRepository avisRepo, CoursMapper mapper, SectionMapper sectionMapper) {
        this.coursRepository = coursRepo;
        this.enseignantRepository = enseignantRepo;
        this.sectionRepository = sectionRepo;
        this.inscriptionRepository = inscriptionRepo;
        this.avisRepository = avisRepo;
        this.coursMapper = mapper;
        this.sectionMapper = sectionMapper;
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
    
    // Méthode avec pagination
    public Page<CoursDTO> getTousLesCoursPaginated(Pageable pageable) {
        return coursRepository.findAll(pageable)
                .map(coursMapper::toDTO);
    }

    @Override
    public CoursDTO getCoursParId(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        return coursMapper.toDTO(cours);
    }

    @Override
    @Transactional(readOnly = true)
    public CoursDetailsDTO getCoursDetailsById(Long id, Long etudiantId) {
        // Utilise findByIdWithDetails pour charger le cours avec sections et inscriptions en une seule requête
        Cours cours = coursRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
        
        CoursDetailsDTO details = new CoursDetailsDTO();
        details.setId(cours.getId());
        details.setTitre(cours.getTitre());
        details.setDescription(cours.getDescription());
        details.setCategorie(cours.getCategorie());
        details.setHoraire(cours.getHoraire());
        details.setImageUrl(cours.getImageUrl());
        details.setDureeEstimeeHeures(cours.getDureeEstimeeHeures());
        details.setDateCreation(cours.getDateCreation());
        
        // Enseignant info
        details.setEnseignantId(cours.getEnseignant().getId());
        details.setEnseignantNom(cours.getEnseignant().getNom());
        details.setEnseignantSpecialite(cours.getEnseignant().getSpecialite());
        
        // Sections avec leçons (chargées par SectionRepository avec JOIN FETCH)
        details.setSections(sectionMapper.toDtoList(
            sectionRepository.findByCoursIdWithLecons(id)
        ));
        
        // Statistiques
        details.setNombreInscrits(inscriptionRepository.countByCoursId(id));
        details.setNotemoyenne(avisRepository.getAverageNoteByCoursId(id));
        details.setNombreAvis(avisRepository.countByCoursId(id));
        
        // Vérifier si l'étudiant est inscrit
        if (etudiantId != null) {
            details.setIsInscrit(inscriptionRepository.existsByEtudiantIdAndCoursId(etudiantId, id));
        } else {
            details.setIsInscrit(false);
        }
        
        return details;
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
