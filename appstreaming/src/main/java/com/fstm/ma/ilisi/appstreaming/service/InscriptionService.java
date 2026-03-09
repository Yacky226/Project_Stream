package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.InscriptionMapper;
import com.fstm.ma.ilisi.appstreaming.mapper.ProgressionLeconMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ProgressionLeconDTO;
import com.fstm.ma.ilisi.appstreaming.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InscriptionService implements InscriptionServiceInterface {
    
    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final LeconRepository leconRepository;
    private final ProgressionLeconRepository progressionLeconRepository;
    private final InscriptionMapper inscriptionMapper;
    private final ProgressionLeconMapper progressionLeconMapper;
    
    @Override
    public InscriptionDTO inscrireEtudiant(Long etudiantId, Long coursId) {
        // Vérifier si déjà inscrit
        if (inscriptionRepository.existsByEtudiantIdAndCoursId(etudiantId, coursId)) {
            throw new IllegalStateException("Student already enrolled in this course");
        }
        
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found with id: " + etudiantId));
        
        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours not found with id: " + coursId));
        
        Inscription inscription = new Inscription();
        inscription.setEtudiant(etudiant);
        inscription.setCours(cours);
        inscription.setDateInscription(LocalDateTime.now());
        inscription.setStatut(StatutInscription.ACTIF);
        inscription.setProgression(0.0);
        
        Inscription savedInscription = inscriptionRepository.save(inscription);
        return inscriptionMapper.toDto(savedInscription);
    }
    
    @Override
    @Transactional(readOnly = true)
    public InscriptionDTO getInscriptionById(Long id) {
        Inscription inscription = inscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription not found with id: " + id));
        return inscriptionMapper.toDto(inscription);
    }
    
    @Override
    @Transactional(readOnly = true)
    public InscriptionDTO getInscriptionByEtudiantAndCours(Long etudiantId, Long coursId) {
        Inscription inscription = inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription not found for student: " + etudiantId + " and course: " + coursId));
        return inscriptionMapper.toDto(inscription);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<InscriptionDTO> getInscriptionsByEtudiant(Long etudiantId) {
        List<Inscription> inscriptions = inscriptionRepository.findByEtudiantId(etudiantId);
        return inscriptionMapper.toDtoList(inscriptions);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<InscriptionDTO> getInscriptionsByCours(Long coursId) {
        List<Inscription> inscriptions = inscriptionRepository.findByCoursId(coursId);
        return inscriptionMapper.toDtoList(inscriptions);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isEtudiantInscrit(Long etudiantId, Long coursId) {
        return inscriptionRepository.existsByEtudiantIdAndCoursId(etudiantId, coursId);
    }
    
    @Override
    public ProgressionLeconDTO marquerLeconTerminee(Long inscriptionId, Long leconId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription not found with id: " + inscriptionId));
        
        Lecon lecon = leconRepository.findById(leconId)
                .orElseThrow(() -> new ResourceNotFoundException("Lecon not found with id: " + leconId));
        
        // Créer ou mettre à jour la progression
        ProgressionLeconId progressionId = new ProgressionLeconId(inscriptionId, leconId);
        ProgressionLecon progression = progressionLeconRepository.findById(progressionId)
                .orElse(new ProgressionLecon());
        
        progression.setId(progressionId);
        progression.setInscription(inscription);
        progression.setLecon(lecon);
        progression.setTermine(true);
        progression.setDateCompletion(LocalDateTime.now());
        
        ProgressionLecon savedProgression = progressionLeconRepository.save(progression);
        
        // Recalculer la progression globale
        calculerProgression(inscriptionId);
        
        return progressionLeconMapper.toDto(savedProgression);
    }
    
    @Override
    public ProgressionLeconDTO marquerLeconNonTerminee(Long inscriptionId, Long leconId) {
        ProgressionLeconId progressionId = new ProgressionLeconId(inscriptionId, leconId);
        ProgressionLecon progression = progressionLeconRepository.findById(progressionId)
                .orElseThrow(() -> new ResourceNotFoundException("Progression not found"));
        
        progression.setTermine(false);
        progression.setDateCompletion(null);
        
        ProgressionLecon savedProgression = progressionLeconRepository.save(progression);
        
        // Recalculer la progression globale
        calculerProgression(inscriptionId);
        
        return progressionLeconMapper.toDto(savedProgression);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ProgressionLeconDTO> getProgressionByInscription(Long inscriptionId) {
        List<ProgressionLecon> progressions = progressionLeconRepository.findByInscriptionId(inscriptionId);
        return progressionLeconMapper.toDtoList(progressions);
    }
    
    @Override
    public Double calculerProgression(Long inscriptionId) {
        Inscription inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription not found with id: " + inscriptionId));
        
        Long coursId = inscription.getCours().getId();
        Long totalLecons = leconRepository.countByCoursId(coursId);
        
        if (totalLecons == 0) {
            inscription.setProgression(0.0);
        } else {
            Long leconsTerminees = progressionLeconRepository.countTermineesByInscriptionId(inscriptionId);
            Double progression = (leconsTerminees.doubleValue() / totalLecons.doubleValue()) * 100;
            inscription.setProgression(Math.round(progression * 100.0) / 100.0);
            
            // Si 100%, marquer comme terminé
            if (progression >= 100.0) {
                inscription.setStatut(StatutInscription.TERMINE);
                inscription.setDateCompletion(LocalDateTime.now());
            }
        }
        
        inscriptionRepository.save(inscription);
        return inscription.getProgression();
    }
}
