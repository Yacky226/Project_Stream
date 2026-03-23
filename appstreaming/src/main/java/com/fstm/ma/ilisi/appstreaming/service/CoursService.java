package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    private final FileStorageService fileStorageService;

    public CoursService(
            CoursRepository coursRepo,
            EnseignantRepository enseignantRepo,
            SectionRepository sectionRepo,
            InscriptionRepository inscriptionRepo,
            AvisRepository avisRepo,
            CoursMapper mapper,
            SectionMapper sectionMapper,
            FileStorageService fileStorageService) {
        this.coursRepository = coursRepo;
        this.enseignantRepository = enseignantRepo;
        this.sectionRepository = sectionRepo;
        this.inscriptionRepository = inscriptionRepo;
        this.avisRepository = avisRepo;
        this.coursMapper = mapper;
        this.sectionMapper = sectionMapper;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @CacheEvict(value = {"cours", "coursDetails"}, allEntries = true)
    public CoursDTO ajouterCours(CoursDTO dto) {
        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouve"));
        Cours cours = coursMapper.toEntity(dto, enseignant);
        return coursMapper.toDTO(coursRepository.save(cours));
    }

    @Override
    @Cacheable(value = "cours")
    public List<CoursDTO> getTousLesCours() {
        return coursRepository.findAll()
                .stream()
                .map(coursMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "cours", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<CoursDTO> getTousLesCoursPaginated(Pageable pageable) {
        return coursRepository.findAll(pageable)
                .map(coursMapper::toDTO);
    }

    @Override
    @Cacheable(value = "coursDetails", key = "#id")
    public CoursDTO getCoursParId(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouve"));
        return coursMapper.toDTO(cours);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coursDetails", key = "#id + '-' + #etudiantId")
    public CoursDetailsDTO getCoursDetailsById(Long id, Long etudiantId) {
        Cours cours = coursRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouve"));

        CoursDetailsDTO details = new CoursDetailsDTO();
        details.setId(cours.getId());
        details.setTitre(cours.getTitre());
        details.setDescription(cours.getDescription());
        details.setCategorie(cours.getCategorie());
        details.setHoraire(cours.getHoraire());
        details.setImageUrl(cours.getImageUrl());
        details.setDureeEstimeeHeures(cours.getDureeEstimeeHeures());
        details.setMetadataJson(cours.getMetadataJson());
        details.setDateCreation(cours.getDateCreation());

        details.setEnseignantId(cours.getEnseignant().getId());
        details.setEnseignantNom(cours.getEnseignant().getNom());
        details.setEnseignantSpecialite(cours.getEnseignant().getSpecialite());

        details.setSections(sectionMapper.toDtoList(
                sectionRepository.findByCoursIdWithLecons(id)
        ));

        details.setNombreInscrits(inscriptionRepository.countByCoursId(id));
        details.setNotemoyenne(avisRepository.getAverageNoteByCoursId(id));
        details.setNombreAvis(avisRepository.countByCoursId(id));

        if (etudiantId != null) {
            details.setIsInscrit(inscriptionRepository.existsByEtudiantIdAndCoursId(etudiantId, id));
        } else {
            details.setIsInscrit(false);
        }

        return details;
    }

    @Override
    @CacheEvict(value = {"cours", "coursDetails"}, allEntries = true)
    public CoursDTO modifierCours(Long id, CoursDTO dto) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouve"));
        String previousImageUrl = cours.getImageUrl();

        Enseignant enseignant = enseignantRepository.findById(dto.getEnseignantId())
                .orElseThrow(() -> new RuntimeException("Enseignant non trouve"));

        cours.setTitre(dto.getTitre());
        cours.setDescription(dto.getDescription());
        cours.setCategorie(dto.getCategorie());
        cours.setHoraire(dto.getHoraire());
        cours.setEnseignant(enseignant);
        if (dto.getImageUrl() != null) {
            cours.setImageUrl(dto.getImageUrl());
        }
        if (dto.getDureeEstimeeHeures() != null) {
            cours.setDureeEstimeeHeures(dto.getDureeEstimeeHeures());
        }
        if (dto.getMetadataJson() != null) {
            cours.setMetadataJson(dto.getMetadataJson());
        }

        Cours saved = coursRepository.save(cours);
        cleanupStoredImage(previousImageUrl, saved.getImageUrl());
        return coursMapper.toDTO(saved);
    }

    @Override
    @CacheEvict(value = {"cours", "coursDetails"}, allEntries = true)
    public void supprimerCours(Long id) {
        Cours cours = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouve"));
        String imageUrl = cours.getImageUrl();
        coursRepository.delete(cours);
        cleanupStoredImage(imageUrl, null);
    }

    private void cleanupStoredImage(String oldImageUrl, String newImageUrl) {
        if (oldImageUrl == null || oldImageUrl.isBlank()) {
            return;
        }

        if (Objects.equals(oldImageUrl, newImageUrl)) {
            return;
        }

        try {
            fileStorageService.deleteFile(oldImageUrl);
        } catch (Exception ignored) {
            // Best effort cleanup only: old URLs may be external or already deleted.
        }
    }
}
