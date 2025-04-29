package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireId(Long destinataireId);
    List<Notification> findByDestinataireIdAndLuFalse(Long destinataireId);
}
