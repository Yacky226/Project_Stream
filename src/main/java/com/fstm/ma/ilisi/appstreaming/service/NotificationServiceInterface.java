package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;

public interface NotificationServiceInterface {
    List<NotificationDTO> getNotificationsUtilisateur(Long utilisateurId);
    void marquerCommeLue(Long notificationId);
    Long countNotificationsNonLues(Long utilisateurId);
    void envoyerNotification(Long destinataireId, String message);

}