package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeconRepository extends JpaRepository<Lecon, Long> {
    
    List<Lecon> findBySectionIdOrderByOrdreAsc(Long sectionId);
    
    @Query("SELECT l FROM Lecon l WHERE l.section.cours.id = :coursId ORDER BY l.section.ordre, l.ordre")
    List<Lecon> findByCoursId(@Param("coursId") Long coursId);
    
    @Query("SELECT COUNT(l) FROM Lecon l WHERE l.section.cours.id = :coursId")
    Long countByCoursId(@Param("coursId") Long coursId);
    
    boolean existsBySectionIdAndOrdre(Long sectionId, Integer ordre);
}
