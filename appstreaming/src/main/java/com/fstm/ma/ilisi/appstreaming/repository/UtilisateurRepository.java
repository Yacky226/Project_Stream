package com.fstm.ma.ilisi.appstreaming.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    
    // Statistiques admin
    @Query("SELECT COUNT(u) FROM Utilisateur u WHERE u.dateCreation > :date")
    Long countByDateCreationAfter(@Param("date") LocalDateTime date);

    @Query("""
            SELECT u FROM Utilisateur u
            WHERE (:role IS NULL OR u.role = :role)
              AND (:actif IS NULL OR u.actif = :actif)
              AND (
                :search IS NULL OR
                LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Utilisateur> findAllForAdmin(
            @Param("role") Role role,
            @Param("actif") Boolean actif,
            @Param("search") String search,
            Pageable pageable);
}
