package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    
    List<Section> findByCoursIdOrderByOrdreAsc(Long coursId);
    
    @Query("SELECT s FROM Section s LEFT JOIN FETCH s.lecons WHERE s.cours.id = :coursId ORDER BY s.ordre ASC")
    List<Section> findByCoursIdWithLecons(@Param("coursId") Long coursId);
    
    boolean existsByCoursIdAndOrdre(Long coursId, Integer ordre);
}
