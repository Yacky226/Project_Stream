package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.dto.*;
import com.fstm.ma.ilisi.appstreaming.security.JwtUtil;
import com.fstm.ma.ilisi.appstreaming.service.AdministrateurServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.EnseignantServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.EtudiantServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.PasswordResetService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EtudiantServiceInterface etudiantService;
    private final EnseignantServiceInterface enseignantService;
    private final AdministrateurServiceInterface administrateurService;
    private final ObjectMapper objectMapper;
    private final String uploadDir = "src/main/resources/static/Uploads/photos/";
    private final PasswordResetService passwordResetService;

   
    

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          EtudiantServiceInterface etudiantService,
                          EnseignantServiceInterface enseignantService,
                          AdministrateurServiceInterface administrateurService,
                          ObjectMapper objectMapper,
                          PasswordResetService passwordResetService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.etudiantService = etudiantService;
        this.enseignantService = enseignantService;
        this.administrateurService = administrateurService;
        this.objectMapper = objectMapper;
        this.passwordResetService=passwordResetService;
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }
    }

    // Inscription Etudiant
    @PostMapping(value = "/register-etudiant", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerEtudiant(
            @Valid @RequestPart("dto") String dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            EtudiantDTO etudiantDTO = objectMapper.readValue(dto, EtudiantDTO.class);
            if (photo != null && !photo.isEmpty()) {
                String photoPath = savePhoto(photo, etudiantDTO.getEmail());
                etudiantDTO.setPhotoProfil(photoPath);
            }
            etudiantService.ajouterEtudiant(etudiantDTO);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Erreur de téléchargement du fichier : " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur interne du serveur"));
        }
    }
    // Inscription Enseignant
    @PostMapping(value = "/register-enseignant", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerEnseignant(
            @Valid @RequestPart("dto") String dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            // Désérialisation manuelle de dto en EnseignantDTO
            EnseignantDTO enseignantDTO = objectMapper.readValue(dto, EnseignantDTO.class);
            
            // Gestion de la photo (si présente)
            if (photo != null && !photo.isEmpty()) {
                String photoPath = savePhoto(photo, enseignantDTO.getEmail());
                enseignantDTO.setPhotoProfil(photoPath);
            }
            
            // Définition du rôle et appel au service
            enseignantDTO.setRole("ENSEIGNANT");
            return ResponseEntity.ok(enseignantService.ajouterEnseignant(enseignantDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Erreur de téléchargement du fichier : " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur interne du serveur"));
        }
    }
    // Inscription Administrateur
    @PostMapping(value = "/register-admin", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerAdmin(
            @Valid @RequestPart("dto") String dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            // Désérialisation manuelle de dto en AdministrateurDTO
            AdministrateurDTO administrateurDTO = objectMapper.readValue(dto, AdministrateurDTO.class);
            
            // Gestion de la photo (si présente)
            if (photo != null && !photo.isEmpty()) {
                String photoPath = savePhoto(photo, administrateurDTO.getEmail());
                administrateurDTO.setPhotoProfil(photoPath);
            }
            
            // Définition du rôle et appel au service
            administrateurDTO.setRole("ADMINISTRATEUR");
            return ResponseEntity.ok(administrateurService.ajouterAdministrateur(administrateurDTO));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Erreur de téléchargement du fichier : " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur interne du serveur"));
        }
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String,String> body) {
      passwordResetService.createPasswordResetToken(body.get("email"));
      return ResponseEntity.ok(Map.of("message","Email envoyé si le compte existe"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String,String> body) {
      passwordResetService.resetPassword(body.get("token"), body.get("newPassword"));
      return ResponseEntity.ok(Map.of("message","Mot de passe mis à jour"));
    }
 

    private String savePhoto(MultipartFile file, String email) throws IOException {
        System.out.println("Début de savePhoto pour email : " + email);
        System.out.println("Taille du fichier : " + file.getSize() + " octets");
        System.out.println("Content-Type : " + file.getContentType());

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Le fichier ne doit pas dépasser 5 Mo");
        }

        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.equals("image/jpeg") && 
             !contentType.equals("image/png") && 
             !contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Seuls les fichiers JPEG et PNG sont acceptés");
        }

        String safeEmail = email.replaceAll("[^a-zA-Z0-9._-]", "");
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo";
        String safeOriginalName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "");
        String fileName = safeEmail + "_" + UUID.randomUUID() + "_" + safeOriginalName;
        System.out.println("Nom de fichier généré : " + fileName);

        Path filePath = Paths.get(uploadDir, fileName);
        System.out.println("Chemin complet : " + filePath.toString());

        Files.createDirectories(filePath.getParent());
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Fichier sauvegardé : " + filePath);
        }

        return "/Uploads/photos/" + fileName;
 
    }
}
