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

    @Override
    public List<NotificationDTO> getNotificationsUtilisateur(Long utilisateurId) {
        return notificationRepository.findByDestinataireId(utilisateurId)
                .stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void marquerCommeLue(Long notificationId, Long utilisateurId) {
        Notification notification = notificationRepository.findByIdAndDestinataireId(notificationId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvee"));
        notification.setLu(true);
        notificationRepository.save(notification);
    }

    @Override
    public void marquerToutesCommeLues(Long utilisateurId) {
        List<Notification> notifications = notificationRepository.findByDestinataireIdAndLuFalse(utilisateurId);
        if (notifications.isEmpty()) {
            return;
        }

        notifications.forEach(notification -> notification.setLu(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void supprimerNotification(Long notificationId, Long utilisateurId) {
        Notification notification = notificationRepository.findByIdAndDestinataireId(notificationId, utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvee"));
        notificationRepository.delete(notification);
    }

    @Override
    public Long countNotificationsNonLues(Long utilisateurId) {
        return notificationRepository.countByDestinataireIdAndLuFalse(utilisateurId);
    }

    @Override
    public void envoyerNotification(Long destinataireId, String message) {
        Utilisateur destinataire = utilisateurRepository.findById(destinataireId)
                .orElseThrow(() -> new ResourceNotFoundException("Destinataire non trouve"));

        Notification notification = new Notification();
        notification.setDestinataire(destinataire);
        notification.setMessage(message);
        notification.setLu(false);
        notification.setDateEnvoi(LocalDateTime.now());

        notificationRepository.save(notification);
    }
}
