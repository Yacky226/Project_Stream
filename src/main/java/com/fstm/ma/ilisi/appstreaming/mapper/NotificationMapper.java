package com.fstm.ma.ilisi.appstreaming.mapper;

import org.springframework.stereotype.Component;

import com.fstm.ma.ilisi.appstreaming.model.bo.Notification;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.NotificationDTO;

@Component
public class NotificationMapper {

    public NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setLu(n.isLu());
        dto.setDate(n.getDate());
        dto.setDestinataireId(n.getDestinataire().getId());
        return dto;
    }

    public Notification toEntity(NotificationDTO dto, Utilisateur destinataire) {
        Notification n = new Notification();
        n.setId(dto.getId());
        n.setMessage(dto.getMessage());
        n.setLu(dto.isLu());
        n.setDate(dto.getDate());
        n.setDestinataire(destinataire);
        return n;
    }
}
