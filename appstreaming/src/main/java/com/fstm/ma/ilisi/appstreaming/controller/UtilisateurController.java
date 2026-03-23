package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.UpdateProfileRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UpdateUserPreferencesRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserPreferencesDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UtilisateurDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.service.FileStorageService;
import com.fstm.ma.ilisi.appstreaming.service.UtilisateurPreferenceServiceInterface;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final UtilisateurPreferenceServiceInterface preferenceService;
    private final FileStorageService fileStorageService;

    public UtilisateurController(UtilisateurRepository utilisateurRepository,
                                 UtilisateurMapper utilisateurMapper,
                                 UtilisateurPreferenceServiceInterface preferenceService,
                                 FileStorageService fileStorageService) {
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurMapper = utilisateurMapper;
        this.preferenceService = preferenceService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/profil")
    public ResponseEntity<Map<String, Object>> getProfil(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        return buildProfileResponse(utilisateur);
    }

    @PutMapping("/profil")
    public ResponseEntity<Map<String, Object>> updateProfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequestDTO request) {

        Utilisateur utilisateur = getCurrentUser(userDetails);

        if (request.getNom() != null) {
            utilisateur.setNom(request.getNom().trim());
        }

        if (request.getPrenom() != null) {
            utilisateur.setPrenom(request.getPrenom().trim());
        }

        if (request.getDateNaissance() != null) {
            utilisateur.setDateNaissance(request.getDateNaissance());
        }

        if (request.getPhotoProfil() != null) {
            utilisateur.setPhotoProfil(request.getPhotoProfil().trim());
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return buildProfileResponse(saved);
    }

    @GetMapping("/preferences")
    public ResponseEntity<Map<String, Object>> getPreferences(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        UserPreferencesDTO data = preferenceService.getPreferences(utilisateur.getId());
        return buildSuccessResponse(data);
    }

    @PutMapping("/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateUserPreferencesRequestDTO request) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        UserPreferencesDTO data = preferenceService.updatePreferences(utilisateur.getId(), request);
        return buildSuccessResponse(data);
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return buildErrorResponse("Le fichier avatar est obligatoire.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            return buildErrorResponse("Le fichier doit etre une image.");
        }

        try {
            Utilisateur utilisateur = getCurrentUser(userDetails);
            String previousAvatar = utilisateur.getPhotoProfil();
            String avatarUrl = fileStorageService.saveFile(file, "avatars");
            utilisateur.setPhotoProfil(avatarUrl);
            utilisateurRepository.save(utilisateur);

            if (previousAvatar != null && !previousAvatar.isBlank() && !previousAvatar.equals(avatarUrl)) {
                try {
                    fileStorageService.deleteFile(previousAvatar);
                } catch (Exception ignored) {
                    // Best effort cleanup: ignore failures when previous URL is external or missing.
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return buildErrorResponse("Impossible de televerser l avatar pour le moment.");
        }
    }

    private Utilisateur getCurrentUser(UserDetails userDetails) {
        String email = userDetails.getUsername();

        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve avec l'email : " + email));
    }

    private ResponseEntity<Map<String, Object>> buildProfileResponse(Utilisateur utilisateur) {
        UtilisateurDTO utilisateurDTO = utilisateurMapper.toDTO(utilisateur);
        return buildSuccessResponse(utilisateurDTO);
    }

    private ResponseEntity<Map<String, Object>> buildSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }
}
