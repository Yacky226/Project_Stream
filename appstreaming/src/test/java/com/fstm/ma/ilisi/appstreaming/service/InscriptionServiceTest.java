package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.InscriptionMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service InscriptionService")
class InscriptionServiceTest {

    @Mock
    private InscriptionRepository inscriptionRepository;

    @Mock
    private CoursRepository coursRepository;

    @Mock
    private EtudiantRepository etudiantRepository;

    @Mock
    private InscriptionMapper inscriptionMapper;

    @InjectMocks
    private InscriptionService inscriptionService;

    private Inscription inscription;
    private InscriptionDTO inscriptionDTO;
    private Cours cours;
    private Etudiant etudiant;
    private Enseignant enseignant;

    @BeforeEach
    void setUp() {
        // Setup Enseignant
        enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setNom("Dupont");
        enseignant.setPrenom("Jean");
        enseignant.setEmail("jean.dupont@test.com");

        // Setup Cours
        cours = new Cours();
        cours.setId(1L);
        cours.setTitre("Introduction à Java");
        cours.setDescription("Cours pour débutants");
        cours.setCategorie("Programmation");
        cours.setHoraire(LocalDateTime.now().plusDays(1));
        cours.setEnseignant(enseignant);

        // Setup Etudiant
        etudiant = new Etudiant();
        etudiant.setId(1L);
        etudiant.setNom("Martin");
        etudiant.setPrenom("Pierre");
        etudiant.setEmail("pierre.martin@test.com");
        etudiant.setNiveau("L3");

        // Setup Inscription
        inscription = new Inscription();
        inscription.setId(1L);
        inscription.setCours(cours);
        inscription.setEtudiant(etudiant);
        inscription.setStatut(StatutInscription.ACTIF);
        inscription.setDateInscription(LocalDateTime.now());

        // Setup InscriptionDTO
        inscriptionDTO = new InscriptionDTO();
        inscriptionDTO.setId(1L);
        inscriptionDTO.setCoursId(1L);
        inscriptionDTO.setEtudiantId(1L);
        inscriptionDTO.setStatut(StatutInscription.ACTIF);
    }

    @Test
    @DisplayName("Inscrire un étudiant - Succès")
    void inscrireEtudiant_Success() {
        // Given
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L)).thenReturn(false);
        when(inscriptionRepository.save(any(Inscription.class))).thenReturn(inscription);
        when(inscriptionMapper.toDto(any(Inscription.class))).thenReturn(inscriptionDTO);

        // When
        InscriptionDTO result = inscriptionService.inscrireEtudiant(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatut()).isEqualTo(StatutInscription.ACTIF);
        verify(inscriptionRepository).save(any(Inscription.class));
    }

    @Test
    @DisplayName("Inscrire un étudiant - Cours introuvable")
    void inscrireEtudiant_CoursNotFound() {
        // Given
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L)).thenReturn(false);
        when(etudiantRepository.findById(1L)).thenReturn(Optional.of(etudiant));
        when(coursRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inscriptionService.inscrireEtudiant(1L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
        
        verify(inscriptionRepository, never()).save(any(Inscription.class));
    }

    @Test
    @DisplayName("Inscrire un étudiant - Étudiant introuvable")
    void inscrireEtudiant_EtudiantNotFound() {
        // Given
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L)).thenReturn(false);
        when(etudiantRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inscriptionService.inscrireEtudiant(1L, 1L))
                .isInstanceOf(ResourceNotFoundException.class);
        
        verify(inscriptionRepository, never()).save(any(Inscription.class));
    }

    @Test
    @DisplayName("Inscrire un étudiant - Déjà inscrit")
    void inscrireEtudiant_AlreadyEnrolled() {
        // Given
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> inscriptionService.inscrireEtudiant(1L, 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Student already enrolled");
        
        verify(inscriptionRepository, never()).save(any(Inscription.class));
    }

    @Test
    @DisplayName("Obtenir les inscriptions d'un étudiant - Succès")
    void getInscriptionsByEtudiant_Success() {
        // Given
        List<Inscription> inscriptions = Arrays.asList(inscription);
        when(inscriptionRepository.findByEtudiantId(1L)).thenReturn(inscriptions);
        when(inscriptionMapper.toDtoList(inscriptions)).thenReturn(Arrays.asList(inscriptionDTO));

        // When
        List<InscriptionDTO> result = inscriptionService.getInscriptionsByEtudiant(1L);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(inscriptionRepository).findByEtudiantId(1L);
    }

    @Test
    @DisplayName("Obtenir les inscriptions d'un cours - Succès")
    void getInscriptionsByCours_Success() {
        // Given
        List<Inscription> inscriptions = Arrays.asList(inscription);
        when(inscriptionRepository.findByCoursId(1L)).thenReturn(inscriptions);
        when(inscriptionMapper.toDtoList(inscriptions)).thenReturn(Arrays.asList(inscriptionDTO));

        // When
        List<InscriptionDTO> result = inscriptionService.getInscriptionsByCours(1L);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        verify(inscriptionRepository).findByCoursId(1L);
    }

    @Test
    @DisplayName("Vérifier si un étudiant est inscrit - Inscrit")
    void isEtudiantInscrit_True() {
        // Given
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L))
                .thenReturn(true);

        // When
        boolean result = inscriptionService.isEtudiantInscrit(1L, 1L);

        // Then
        assertThat(result).isTrue();
        verify(inscriptionRepository).existsByEtudiantIdAndCoursId(1L, 1L);
    }

    @Test
    @DisplayName("Vérifier si un étudiant est inscrit - Non inscrit")
    void isEtudiantInscrit_False() {
        // Given
        when(inscriptionRepository.existsByEtudiantIdAndCoursId(1L, 1L))
                .thenReturn(false);

        // When
        boolean result = inscriptionService.isEtudiantInscrit(1L, 1L);

        // Then
        assertThat(result).isFalse();
        verify(inscriptionRepository).existsByEtudiantIdAndCoursId(1L, 1L);
    }
}
