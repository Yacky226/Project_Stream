package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {
    List<Cours> findByCategorieContainingIgnoreCase(String categorie);
    List<Cours> findByEnseignantId(Long enseignantId);
    
    // Optimisation N+1 : Charge le cours avec sections et inscriptions en une seule requête
    @EntityGraph(attributePaths = {"sections", "inscriptions", "enseignant"})
    @Query("SELECT c FROM Cours c WHERE c.id = :id")
    Optional<Cours> findByIdWithDetails(Long id);
    
    
    // Optimisation pour la liste des cours : charge l'enseignant avec les cours
    @EntityGraph(attributePaths = {"enseignant"})
    @Query("SELECT c FROM Cours c")
    List<Cours> findAllWithEnseignant();
    
    // Optimisation pour recherche par catégorie
    @EntityGraph(attributePaths = {"enseignant"})
    List<Cours> findByCategorieContainingIgnoreCaseWithEnseignant(String categorie);
    
    // Statistiques admin
    Long countByArchiveFalse();
    Long countByArchiveTrue();
    
    @Query("SELECT e.nom, e.prenom, COUNT(c) FROM Cours c JOIN c.enseignant e GROUP BY e.id, e.nom, e.prenom ORDER BY COUNT(c) DESC LIMIT 5")
    List<Object[]> findTop5EnseignantsByCourses();
}
