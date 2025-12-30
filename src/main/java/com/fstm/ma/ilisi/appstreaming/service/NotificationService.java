package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.NotificationMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Notification;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;
import com.fstm.ma.ilisi.appstreaming.repository.NotificationRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService implements NotificationServiceInterface {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UtilisateurRepository utilisateurRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationMapper notificationMapper,
            UtilisateurRepository utilisateurRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * Récupère toutes les notifications d'un utilisateur
     */
    @Override
    public List<NotificationDTO> getNotificationsUtilisateur(Long utilisateurId) {
        return notificationRepository.findByDestinataireId(utilisateurId)
                .stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marque une notification comme lue
     */
    @Override
    public void marquerCommeLue(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée"));
        notification.setLu(true);
        notificationRepository.save(notification);
    }

    /**
     * Compte les notifications non lues d’un utilisateur
     */
    @Override
    public Long countNotificationsNonLues(Long utilisateurId) {
        return notificationRepository.countByDestinataireIdAndLuFalse(utilisateurId);
    }

    /**
     * Crée et envoie une nouvelle notification à un utilisateur
     */
    @Override
    public void envoyerNotification(Long destinataireId, String message) {
        Utilisateur destinataire = utilisateurRepository.findById(destinataireId)
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire non trouvé"));

        Notification notification = new Notification();
        notification.setDestinataire(destinataire);
        notification.setMessage(message);
        notification.setLu(false);
        notification.setDateEnvoi(LocalDateTime.now());

        notificationRepository.save(notification);
    }
}
