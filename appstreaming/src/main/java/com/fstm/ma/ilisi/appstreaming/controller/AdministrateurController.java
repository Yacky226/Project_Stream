package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CourseManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.DashboardStatsDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.EnseignantDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.PageResponse;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.service.AdministrateurService;
import com.fstm.ma.ilisi.appstreaming.service.EnseignantService;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdministrateurController {

    private final AdministrateurService administrateurService;
    private final EnseignantService enseignantService;
    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;

    public AdministrateurController(AdministrateurService administrateurService,
                                     EnseignantService enseignantService,
                                     UtilisateurRepository utilisateurRepository,
                                     UtilisateurMapper utilisateurMapper) {
        this.administrateurService = administrateurService;
        this.enseignantService = enseignantService;
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
    }

    // ================== GESTION BASIQUE ADMIN ==================

    //  Ajouter un nouvel administrateur
    @PostMapping("/ajouter-admin")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<AdministrateurDTO> ajouterAdministrateur(@Valid @RequestBody AdministrateurDTO dto) {
        return ResponseEntity.ok(administrateurService.ajouterAdministrateur(dto));
    }

    //  Ajouter un nouvel enseignant
    @PostMapping("/ajouter-enseignant")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<EnseignantDTO> ajouterEnseignant(@Valid @RequestBody EnseignantDTO dto) {
        return ResponseEntity.ok(enseignantService.ajouterEnseignant(dto));
    }

    //  Voir tous les utilisateurs (avec pagination optionnelle)
    @GetMapping("/utilisateurs")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<?> getTousLesUtilisateurs(
            @RequestParam(required = false, defaultValue = "false") boolean paginate,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDir) {
        
        if (paginate) {
            Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<UtilisateurDTO> utilisateursPage = utilisateurRepository.findAll(pageable)
                    .map(utilisateurMapper::toDTO);
            
            PageResponse<UtilisateurDTO> response = new PageResponse<>(
                utilisateursPage.getContent(),
                utilisateursPage.getNumber(),
                utilisateursPage.getSize(),
                utilisateursPage.getTotalElements()
            );
            return ResponseEntity.ok(response);
        } else {
            List<UtilisateurDTO> utilisateurs = utilisateurRepository.findAll()
                    .stream()
                    .map(utilisateurMapper::toDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(utilisateurs);
        }
    }
    
    // ================== DASHBOARD ET STATISTIQUES ==================
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<DashboardStatsDTO> getDashboard() {
        return ResponseEntity.ok(administrateurService.getDashboardStats());
    }
    
    // ================== GESTION DES UTILISATEURS ==================
    
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        return ResponseEntity.ok(administrateurService.getAllUsers());
    }
    
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<UserManagementDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(administrateurService.getUserById(id));
    }
    
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<UserManagementDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserManagementDTO dto) {
        return ResponseEntity.ok(administrateurService.updateUser(id, dto));
    }
    
    @PatchMapping("/users/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<String> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean actif) {
        administrateurService.toggleUserStatus(id, actif);
        return ResponseEntity.ok(actif ? "Utilisateur activé" : "Utilisateur désactivé");
    }
    
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        administrateurService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
    
    // ================== GESTION DES COURS ==================
    
    @GetMapping("/courses")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<?> getAllCourses(
            @RequestParam(required = false, defaultValue = "false") boolean paginate,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "15") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir) {
        
        if (paginate) {
            Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<CourseManagementDTO> coursesPage = administrateurService.getAllCoursesForAdminPaginated(pageable);
            
            PageResponse<CourseManagementDTO> response = new PageResponse<>(
                coursesPage.getContent(),
                coursesPage.getNumber(),
                coursesPage.getSize(),
                coursesPage.getTotalElements()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(administrateurService.getAllCoursesForAdmin());
        }
    }
    
    @GetMapping("/courses/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<CourseManagementDTO> getCourseDetails(@PathVariable Long id) {
        return ResponseEntity.ok(administrateurService.getCourseDetailsForAdmin(id));
    }
    
    @PatchMapping("/courses/{id}/archive")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<String> archiveCourse(@PathVariable Long id) {
        administrateurService.archiveCourse(id);
        return ResponseEntity.ok("Cours archivé");
    }
    
    @PatchMapping("/courses/{id}/unarchive")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<String> unarchiveCourse(@PathVariable Long id) {
        administrateurService.unarchiveCourse(id);
        return ResponseEntity.ok("Cours désarchivé");
    }
    
    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        administrateurService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }
    
    // ================== GESTION DES INSCRIPTIONS ==================
    
    @GetMapping("/inscriptions")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<?> getAllInscriptions(
            @RequestParam(required = false, defaultValue = "false") boolean paginate,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir) {
        
        if (paginate) {
            Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<InscriptionManagementDTO> inscriptionsPage = administrateurService.getAllInscriptionsPaginated(pageable);
            
            PageResponse<InscriptionManagementDTO> response = new PageResponse<>(
                inscriptionsPage.getContent(),
                inscriptionsPage.getNumber(),
                inscriptionsPage.getSize(),
                inscriptionsPage.getTotalElements()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(administrateurService.getAllInscriptions());
        }
    }
    
    @GetMapping("/inscriptions/course/{coursId}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<InscriptionManagementDTO>> getInscriptionsByCourse(@PathVariable Long coursId) {
        return ResponseEntity.ok(administrateurService.getInscriptionsByCourse(coursId));
    }
    
    @GetMapping("/inscriptions/student/{etudiantId}")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<List<InscriptionManagementDTO>> getInscriptionsByStudent(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(administrateurService.getInscriptionsByStudent(etudiantId));
    }
    
    @PatchMapping("/inscriptions/{id}/cancel")
    @PreAuthorize("hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<String> cancelInscription(@PathVariable Long id) {
        administrateurService.cancelInscription(id);
        return ResponseEntity.ok("Inscription annulée");
    }
}
