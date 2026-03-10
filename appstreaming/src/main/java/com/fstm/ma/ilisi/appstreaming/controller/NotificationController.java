package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    public NotificationController(NotificationService notificationService, UtilisateurRepository utilisateurRepository) {
        this.notificationService = notificationService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getMesNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        List<NotificationDTO> notifications = notificationService.getNotificationsUtilisateur(utilisateur.getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marquerNotificationCommeLue(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        notificationService.marquerCommeLue(id, utilisateur.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marquerToutesLesNotificationsCommeLues(
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        notificationService.marquerToutesCommeLues(utilisateur.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> supprimerNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        notificationService.supprimerNotification(id, utilisateur.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getNombreNotificationsNonLues(@AuthenticationPrincipal UserDetails userDetails) {
        Utilisateur utilisateur = getCurrentUser(userDetails);
        Long count = notificationService.countNotificationsNonLues(utilisateur.getId());
        return ResponseEntity.ok(count);
    }

    private Utilisateur getCurrentUser(UserDetails userDetails) {
        String email = userDetails.getUsername();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
    }
}
