package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.ProgressionLecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.ProgressionLeconId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressionLeconRepository extends JpaRepository<ProgressionLecon, ProgressionLeconId> {
    
    List<ProgressionLecon> findByInscriptionId(Long inscriptionId);
    
    Optional<ProgressionLecon> findByInscriptionIdAndId_LeconId(Long inscriptionId, Long leconId);
    
    @Query("SELECT COUNT(pl) FROM ProgressionLecon pl WHERE pl.inscription.id = :inscriptionId AND pl.termine = true")
    Long countTermineesByInscriptionId(@Param("inscriptionId") Long inscriptionId);
    
    boolean existsByInscriptionIdAndId_LeconId(Long inscriptionId, Long leconId);
}
