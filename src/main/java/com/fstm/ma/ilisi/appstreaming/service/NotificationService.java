package com.fstm.ma.ilisi.appstreaming.service;


import com.fstm.ma.ilisi.appstreaming.mapper.NotificationMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Notification;
import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;
import com.fstm.ma.ilisi.appstreaming.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService implements NotificationServiceInterface {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public NotificationService(NotificationRepository notificationRepository,
                                   NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public List<NotificationDTO> getNotificationsUtilisateur(Long utilisateurId) {
        List<Notification> notifications = notificationRepository.findByDestinataireId(utilisateurId);

        return notifications.stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void marquerCommeLue(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));

        notification.setLu(true);
        notificationRepository.save(notification);
    }
}
