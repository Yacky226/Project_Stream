package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    
    List<Avis> findByCoursIdOrderByDateCreationDesc(Long coursId);
    
    Optional<Avis> findByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    
    boolean existsByEtudiantIdAndCoursId(Long etudiantId, Long coursId);
    
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.cours.id = :coursId")
    Double getAverageNoteByCoursId(@Param("coursId") Long coursId);
    
    @Query("SELECT COUNT(a) FROM Avis a WHERE a.cours.id = :coursId")
    Long countByCoursId(@Param("coursId") Long coursId);
    
    // Statistiques admin
    @Query("SELECT AVG(a.note) FROM Avis a")
    Double findAverageNote();
    
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.cours.id = :coursId")
    Double findAverageNoteForCours(@Param("coursId") Long coursId);
}
