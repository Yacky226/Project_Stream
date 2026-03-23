package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CoursDetailsDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.PageResponse;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.service.CoursService;
import com.fstm.ma.ilisi.appstreaming.service.FileStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cours")
@CrossOrigin(origins = "*")
public class CoursController {

    private final CoursService coursService;
    private final EtudiantRepository etudiantRepository;
    private final FileStorageService fileStorageService;

    public CoursController(
            CoursService coursService,
            EtudiantRepository etudiantRepository,
            FileStorageService fileStorageService) {
        this.coursService = coursService;
        this.etudiantRepository = etudiantRepository;
        this.fileStorageService = fileStorageService;
    }

    //  Créer un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @PostMapping
    public ResponseEntity<CoursDTO> ajouterCours(@Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.ajouterCours(dto));
    }

    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @PostMapping("/thumbnail")
    public ResponseEntity<Map<String, Object>> uploadCourseThumbnail(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(buildErrorResponse("Le fichier miniature est obligatoire."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            return ResponseEntity.badRequest().body(buildErrorResponse("Le fichier doit etre une image."));
        }

        try {
            String imageUrl = fileStorageService.saveFile(file, "course-thumbnails");
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(buildErrorResponse("Impossible de televerser la miniature pour le moment."));
        }
    }

    //  Modifier un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @PutMapping("/{id}")
    public ResponseEntity<CoursDTO> modifierCours(@PathVariable Long id, @Valid @RequestBody CoursDTO dto) {
        return ResponseEntity.ok(coursService.modifierCours(id, dto));
    }

    //  Supprimer un cours
    @PreAuthorize("hasAnyAuthority('ADMINISTRATEUR', 'ENSEIGNANT')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerCours(@PathVariable Long id) {
        coursService.supprimerCours(id);
        return ResponseEntity.ok().build();
    }

    //  Voir tous les cours (avec pagination optionnelle)
    @GetMapping
    public ResponseEntity<?> getTousLesCours(
            @RequestParam(required = false, defaultValue = "false") boolean paginate,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "ASC") String sortDir) {
        
        if (paginate) {
            Sort sort = sortDir.equalsIgnoreCase("DESC") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<CoursDTO> coursPage = coursService.getTousLesCoursPaginated(pageable);
            
            PageResponse<CoursDTO> response = new PageResponse<>(
                coursPage.getContent(),
                coursPage.getNumber(),
                coursPage.getSize(),
                coursPage.getTotalElements()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(coursService.getTousLesCours());
        }
    }

    //  Voir un cours par ID (simple)
    @GetMapping("/{id}")
    public ResponseEntity<CoursDTO> getCoursById(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.getCoursParId(id));
    }

    //  Voir les détails complets d'un cours avec sections, leçons, statistiques
    @GetMapping("/{id}/details")
    public ResponseEntity<CoursDetailsDTO> getCoursDetails(
            @PathVariable Long id,
            @RequestParam(required = false) Long etudiantId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long resolvedEtudiantId = etudiantId;
        if (resolvedEtudiantId == null && userDetails != null) {
            resolvedEtudiantId = etudiantRepository.findByEmail(userDetails.getUsername())
                    .map(etudiant -> etudiant.getId())
                    .orElse(null);
        }
        return ResponseEntity.ok(coursService.getCoursDetailsById(id, resolvedEtudiantId));
    }

    private Map<String, Object> buildErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
}
