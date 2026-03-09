package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionRepository extends JpaRepository<Inscription, Long> {
    
    Optional<Inscription> findByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    
    // Optimisation : Charge les inscriptions avec étudiant et cours
    @EntityGraph(attributePaths = {"etudiant", "cours", "cours.enseignant"})
    List<Inscription> findByEtudiantId(Long etudiantId);
    
    // Optimisation : Charge les inscriptions avec étudiant
    @EntityGraph(attributePaths = {"etudiant"})
    List<Inscription> findByCoursId(Long coursId);
    
    List<Inscription> findByEtudiantIdAndStatut(Long etudiantId, StatutInscription statut);
    
    boolean existsByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    
    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.cours.id = :coursId")
    Long countByCoursId(@Param("coursId") Long coursId);
    
    @Query("SELECT i FROM Inscription i LEFT JOIN FETCH i.progressionLecons WHERE i.id = :inscriptionId")
    Optional<Inscription> findByIdWithProgression(@Param("inscriptionId") Long inscriptionId);
    
    // Statistiques admin
    Long countByStatut(StatutInscription statut);
    
    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.dateInscription > :date")
    Long countByDateInscriptionAfter(@Param("date") java.time.LocalDateTime date);
    
    @Query("SELECT AVG(i.progression) FROM Inscription i")
    Double findAverageProgression();
    
    @Query("SELECT c.titre, COUNT(i) FROM Inscription i JOIN i.cours c GROUP BY c.id, c.titre ORDER BY COUNT(i) DESC LIMIT 5")
    List<Object[]> findTop5CoursesByInscriptions();
    
    @Query("SELECT COUNT(i) FROM Inscription i WHERE i.cours = :cours AND i.statut = :statut")
    Long countByCoursAndStatut(@Param("cours") com.fstm.ma.ilisi.appstreaming.model.bo.Cours cours, @Param("statut") StatutInscription statut);
    
    @Query("SELECT i FROM Inscription i WHERE i.etudiant = :etudiant AND i.cours = :cours")
    Optional<Inscription> findByEtudiantAndCours(
            @Param("etudiant") com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant etudiant,
            @Param("cours") com.fstm.ma.ilisi.appstreaming.model.bo.Cours cours);
}
