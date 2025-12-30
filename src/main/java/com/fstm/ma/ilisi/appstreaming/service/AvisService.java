package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.AvisMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Avis;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.dto.AvisDTO;
import com.fstm.ma.ilisi.appstreaming.repository.AvisRepository;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AvisService implements AvisServiceInterface {
    
    private final AvisRepository avisRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final AvisMapper avisMapper;
    
    @Override
    public AvisDTO creerAvis(AvisDTO avisDTO) {
        // Vérifier que l'étudiant est inscrit au cours
        if (!inscriptionRepository.existsByEtudiantIdAndCoursId(avisDTO.getEtudiantId(), avisDTO.getCoursId())) {
            throw new IllegalStateException("Student must be enrolled in the course to leave a review");
        }
        
        // Vérifier qu'il n'y a pas déjà un avis
        if (avisRepository.existsByEtudiantIdAndCoursId(avisDTO.getEtudiantId(), avisDTO.getCoursId())) {
            throw new IllegalStateException("Student has already reviewed this course");
        }
        
        Etudiant etudiant = etudiantRepository.findById(avisDTO.getEtudiantId())
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant not found with id: " + avisDTO.getEtudiantId()));
        
        Cours cours = coursRepository.findById(avisDTO.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours not found with id: " + avisDTO.getCoursId()));
        
        Avis avis = avisMapper.toEntity(avisDTO);
        avis.setEtudiant(etudiant);
        avis.setCours(cours);
        avis.setDateCreation(LocalDateTime.now());
        
        Avis savedAvis = avisRepository.save(avis);
        return avisMapper.toDto(savedAvis);
    }
    
    @Override
    public AvisDTO updateAvis(Long id, AvisDTO avisDTO) {
        Avis existingAvis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis not found with id: " + id));
        
        existingAvis.setNote(avisDTO.getNote());
        existingAvis.setCommentaire(avisDTO.getCommentaire());
        existingAvis.setDateModification(LocalDateTime.now());
        
        Avis updatedAvis = avisRepository.save(existingAvis);
        return avisMapper.toDto(updatedAvis);
    }
    
    @Override
    public void deleteAvis(Long id) {
        if (!avisRepository.existsById(id)) {
            throw new ResourceNotFoundException("Avis not found with id: " + id);
        }
        avisRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AvisDTO getAvisById(Long id) {
        Avis avis = avisRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avis not found with id: " + id));
        return avisMapper.toDto(avis);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AvisDTO> getAvisByCours(Long coursId) {
        List<Avis> avisList = avisRepository.findByCoursIdOrderByDateCreationDesc(coursId);
        return avisMapper.toDtoList(avisList);
    }
    
    @Override
    @Transactional(readOnly = true)
    public AvisDTO getAvisByEtudiantAndCours(Long etudiantId, Long coursId) {
        Avis avis = avisRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis not found for student: " + etudiantId + " and course: " + coursId));
        return avisMapper.toDto(avis);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getAverageNoteByCours(Long coursId) {
        Double average = avisRepository.getAverageNoteByCoursId(coursId);
        return average != null ? Math.round(average * 10.0) / 10.0 : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countAvisByCours(Long coursId) {
        return avisRepository.countByCoursId(coursId);
    }
}
