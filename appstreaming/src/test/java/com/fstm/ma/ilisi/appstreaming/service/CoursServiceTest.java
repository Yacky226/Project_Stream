package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.CoursMapper;
import com.fstm.ma.ilisi.appstreaming.mapper.SectionMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.repository.AvisRepository;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
@DisplayName("Tests du service CoursService")
class CoursServiceTest {

    @Mock
    private CoursRepository coursRepository;

    @Mock
    private EnseignantRepository enseignantRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private InscriptionRepository inscriptionRepository;

    @Mock
    private AvisRepository avisRepository;

    @Mock
    private CoursMapper coursMapper;

    @Mock
    private SectionMapper sectionMapper;

    @InjectMocks
    private CoursService coursService;

    private Cours cours;
    private CoursDTO coursDTO;
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
        cours.setDescription("Cours pour débutants en Java");
        cours.setCategorie("Programmation");
        cours.setHoraire(LocalDateTime.now().plusDays(1));
        cours.setEnseignant(enseignant);
        cours.setDateCreation(LocalDateTime.now());

        // Setup CoursDTO
        coursDTO = new CoursDTO();
        coursDTO.setId(1L);
        coursDTO.setTitre("Introduction à Java");
        coursDTO.setDescription("Cours pour débutants en Java");
        coursDTO.setCategorie("Programmation");
        coursDTO.setEnseignantId(1L);
    }

    @Test
    @DisplayName("Ajouter un cours - Succès")
    void ajouterCours_Success() {
        // Given
        when(enseignantRepository.findById(1L)).thenReturn(Optional.of(enseignant));
        when(coursMapper.toEntity(any(CoursDTO.class), any(Enseignant.class))).thenReturn(cours);
        when(coursRepository.save(any(Cours.class))).thenReturn(cours);
        when(coursMapper.toDTO(any(Cours.class))).thenReturn(coursDTO);

        // When
        CoursDTO result = coursService.ajouterCours(coursDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTitre()).isEqualTo("Introduction à Java");
        verify(enseignantRepository).findById(1L);
        verify(coursRepository).save(any(Cours.class));
    }

    @Test
    @DisplayName("Ajouter un cours - Enseignant introuvable")
    void ajouterCours_EnseignantNotFound() {
        // Given
        when(enseignantRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> coursService.ajouterCours(coursDTO))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Enseignant non trouvé");
        
        verify(enseignantRepository).findById(anyLong());
        verify(coursRepository, never()).save(any(Cours.class));
    }

    @Test
    @DisplayName("Obtenir tous les cours - Succès")
    void getTousLesCours_Success() {
        // Given
        List<Cours> coursList = Arrays.asList(cours);
        when(coursRepository.findAll()).thenReturn(coursList);
        when(coursMapper.toDTO(any(Cours.class))).thenReturn(coursDTO);

        // When
        List<CoursDTO> result = coursService.getTousLesCours();

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("Introduction à Java");
        verify(coursRepository).findAll();
    }

    @Test
    @DisplayName("Obtenir tous les cours paginés - Succès")
    void getTousLesCoursPaginated_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Cours> coursPage = new PageImpl<>(Arrays.asList(cours), pageable, 1);
        when(coursRepository.findAll(pageable)).thenReturn(coursPage);
        when(coursMapper.toDTO(any(Cours.class))).thenReturn(coursDTO);

        // When
        Page<CoursDTO> result = coursService.getTousLesCoursPaginated(pageable);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitre()).isEqualTo("Introduction à Java");
        verify(coursRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Obtenir un cours par ID - Succès")
    void getCoursParId_Success() {
        // Given
        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(coursMapper.toDTO(any(Cours.class))).thenReturn(coursDTO);

        // When
        CoursDTO result = coursService.getCoursParId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitre()).isEqualTo("Introduction à Java");
        verify(coursRepository).findById(1L);
    }

    @Test
    @DisplayName("Obtenir un cours par ID - Cours introuvable")
    void getCoursParId_NotFound() {
        // Given
        when(coursRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> coursService.getCoursParId(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cours non trouvé");
        
        verify(coursRepository).findById(999L);
    }

    @Test
    @DisplayName("Modifier un cours - Succès")
    void modifierCours_Success() {
        // Given
        CoursDTO updatedDTO = new CoursDTO();
        updatedDTO.setTitre("Java Avancé");
        updatedDTO.setDescription("Cours avancé");
        updatedDTO.setEnseignantId(1L);

        when(coursRepository.findById(1L)).thenReturn(Optional.of(cours));
        when(enseignantRepository.findById(1L)).thenReturn(Optional.of(enseignant));
        when(coursRepository.save(any(Cours.class))).thenReturn(cours);
        when(coursMapper.toDTO(any(Cours.class))).thenReturn(updatedDTO);

        // When
        CoursDTO result = coursService.modifierCours(1L, updatedDTO);

        // Then
        assertThat(result).isNotNull();
        verify(coursRepository).findById(1L);
        verify(coursRepository).save(any(Cours.class));
    }

    @Test
    @DisplayName("Supprimer un cours - Succès")
    void supprimerCours_Success() {
        // Given
        doNothing().when(coursRepository).deleteById(1L);

        // When
        coursService.supprimerCours(1L);

        // Then
        verify(coursRepository).deleteById(1L);
    }

    /*
    @Test
    @DisplayName("Supprimer un cours - Cours introuvable")
    void supprimerCours_NotFound() {
        // Given
        when(coursRepository.findById(anyLong())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> coursService.supprimerCours(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cours non trouvé");
        
        verify(coursRepository).findById(999L);
        verify(coursRepository, never()).delete(any(Cours.class));
    }
    */
}
