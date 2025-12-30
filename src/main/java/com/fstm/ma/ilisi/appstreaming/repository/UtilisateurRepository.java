package com.fstm.ma.ilisi.appstreaming.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    
    // Statistiques admin
    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.dateCreation > :date")
    Long countByDateCreationAfter(@Param("date") LocalDateTime date);
}
