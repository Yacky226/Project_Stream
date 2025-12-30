package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;
import com.fstm.ma.ilisi.appstreaming.service.NotificationService;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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

    //  Voir toutes ses notifications
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getMesNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        List<NotificationDTO> notifications = notificationService.getNotificationsUtilisateur(utilisateur.getId());
        return ResponseEntity.ok(notifications);
    }

    //  Marquer une notification comme lue
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marquerNotificationCommeLue(@PathVariable Long id) {
        notificationService.marquerCommeLue(id);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getNombreNotificationsNonLues(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long count = notificationService.countNotificationsNonLues(utilisateur.getId());
        return ResponseEntity.ok(count);
    }

}
