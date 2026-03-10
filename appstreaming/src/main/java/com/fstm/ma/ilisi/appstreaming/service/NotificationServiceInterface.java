package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;

public interface NotificationServiceInterface {
    List<NotificationDTO> getNotificationsUtilisateur(Long utilisateurId);
    void marquerCommeLue(Long notificationId, Long utilisateurId);
    void marquerToutesCommeLues(Long utilisateurId);
    void supprimerNotification(Long notificationId, Long utilisateurId);
    Long countNotificationsNonLues(Long utilisateurId);
    void envoyerNotification(Long destinataireId, String message);

}
