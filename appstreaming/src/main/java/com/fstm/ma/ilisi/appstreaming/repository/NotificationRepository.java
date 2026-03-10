package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;
import java.util.Optional;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireId(Long destinataireId);
    List<Notification> findByDestinataireIdAndLuFalse(Long destinataireId);
    Long countByDestinataireIdAndLuFalse(Long destinataireId);
    Optional<Notification> findByIdAndDestinataireId(Long id, Long destinataireId);

}
