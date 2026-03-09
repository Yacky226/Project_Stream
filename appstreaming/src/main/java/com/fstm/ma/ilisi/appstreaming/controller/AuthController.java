package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.RefreshToken;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.*;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.security.JwtUtil;
import com.fstm.ma.ilisi.appstreaming.service.AdministrateurServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.EnseignantServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.EtudiantServiceInterface;
import com.fstm.ma.ilisi.appstreaming.service.PasswordResetService;
import com.fstm.ma.ilisi.appstreaming.service.RefreshTokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EtudiantServiceInterface etudiantService;
    private final EnseignantServiceInterface enseignantService;
    private final AdministrateurServiceInterface administrateurService;
    private final ObjectMapper objectMapper;
    private final String uploadDir = "src/main/resources/static/Uploads/photos/";
    private final PasswordResetService passwordResetService;
    private final Validator validator;
    private final RefreshTokenService refreshTokenService;
    private final UtilisateurRepository utilisateurRepository;

   
    

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          EtudiantServiceInterface etudiantService,
                          EnseignantServiceInterface enseignantService,
                          AdministrateurServiceInterface administrateurService,
                          ObjectMapper objectMapper,
                          PasswordResetService passwordResetService,
                          Validator validator,
                          RefreshTokenService refreshTokenService,
                          UtilisateurRepository utilisateurRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.etudiantService = etudiantService;
        this.enseignantService = enseignantService;
        this.administrateurService = administrateurService;
        this.objectMapper = objectMapper;
        this.passwordResetService=passwordResetService;
        this.validator = validator;
        this.refreshTokenService = refreshTokenService;
        this.utilisateurRepository = utilisateurRepository;
    }

    private <T> void validateDTO(T dto) {
        java.util.Set<ConstraintViolation<T>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }

    /**
     * Login avec génération d'access token et refresh token.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Récupérer l'utilisateur pour avoir l'ID et le rôle
            Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            
            // Générer l'access token
            String accessToken = jwtUtil.generateToken(userDetails, utilisateur.getId());
            
            // Générer le refresh token
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIP(httpRequest);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                    utilisateur.getId(), userAgent, ipAddress);
            
            log.info("Login réussi pour l'utilisateur: {}", request.getEmail());
            
            // Retourner la réponse complète
            AuthResponse response = AuthResponse.of(
                    accessToken,
                    refreshToken.getToken(),
                    jwtUtil.getAccessTokenExpirationSeconds(),
                    utilisateur.getEmail(),
                    utilisateur.getRole().name(),
                    utilisateur.getId()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Échec de login pour: {}", request.getEmail());
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }
    }

    /**
     * Rafraîchit l'access token en utilisant un refresh token valide.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        
        // Vérifier le refresh token
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(requestRefreshToken);
        Utilisateur utilisateur = refreshToken.getUtilisateur();
        
        // Effectuer une rotation du refresh token (bonne pratique de sécurité)
        RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken);
        
        // Générer un nouvel access token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(utilisateur.getEmail())
                .password(utilisateur.getPassword())
                .authorities(utilisateur.getRole().name())
                .build();
        
        String newAccessToken = jwtUtil.generateToken(userDetails, utilisateur.getId());
        
        log.info("Token rafraîchi pour l'utilisateur: {}", utilisateur.getEmail());
        
        AuthResponse response = AuthResponse.of(
                newAccessToken,
                newRefreshToken.getToken(),
                jwtUtil.getAccessTokenExpirationSeconds(),
                utilisateur.getEmail(),
                utilisateur.getRole().name(),
                utilisateur.getId()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Déconnexion - révoque le refresh token actuel.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            refreshTokenService.revokeToken(request.getRefreshToken());
            log.info("Logout - Refresh token révoqué");
        }
        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
    }

    /**
     * Déconnexion de toutes les sessions - révoque tous les refresh tokens de l'utilisateur.
     */
    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            refreshTokenService.revokeAllUserTokensByEmail(email);
            log.info("Logout-all - Tous les tokens révoqués pour: {}", email);
        }
        return ResponseEntity.ok(Map.of("message", "Déconnexion de toutes les sessions réussie"));
    }

    /**
     * Récupère l'IP du client (gère les proxies).
     */
    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }

    // Inscription Etudiant
    @PostMapping(value = "/register-etudiant", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerEtudiant(
            @Valid @RequestPart("dto") String dto,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            EtudiantDTO etudiantDTO = objectMapper.readValue(dto, EtudiantDTO.class);
            validateDTO(etudiantDTO);

            if (photo != null && !photo.isEmpty()) {
                String photoPath = savePhoto(photo, etudiantDTO.getEmail());
                etudiantDTO.setPhotoProfil(photoPath);
            }
            etudiantService.ajouterEtudiant(etudiantDTO);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException | ConstraintViolationException e) {
            throw e; // Laisser le GlobalExceptionHandler gérer
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
            validateDTO(enseignantDTO);
            
            // Gestion de la photo (si présente)
            if (photo != null && !photo.isEmpty()) {
                String photoPath = savePhoto(photo, enseignantDTO.getEmail());
                enseignantDTO.setPhotoProfil(photoPath);
            }
            
            // Définition du rôle et appel au service
            enseignantDTO.setRole("ENSEIGNANT");
            return ResponseEntity.ok(enseignantService.ajouterEnseignant(enseignantDTO));
        } catch (IllegalArgumentException | ConstraintViolationException e) {
            throw e;
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
            validateDTO(administrateurDTO);
            
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
