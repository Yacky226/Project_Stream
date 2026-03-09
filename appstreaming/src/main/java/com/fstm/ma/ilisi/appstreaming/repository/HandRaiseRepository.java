package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.HandRaise;
import com.fstm.ma.ilisi.appstreaming.model.bo.HandRaiseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HandRaiseRepository extends JpaRepository<HandRaise, Long> {
    
    List<HandRaise> findBySessionIdAndStatutOrderByOrdreAsc(Long sessionId, HandRaiseStatus statut);
    
    Optional<HandRaise> findBySessionIdAndEtudiantIdAndStatut(Long sessionId, Long etudiantId, HandRaiseStatus statut);
    
    boolean existsBySessionIdAndEtudiantIdAndStatut(Long sessionId, Long etudiantId, HandRaiseStatus statut);
    
    @Query("SELECT hr FROM HandRaise hr WHERE hr.session.id = :sessionId AND hr.statut = 'PENDING' ORDER BY hr.ordre ASC, hr.timestampDemande ASC")
    List<HandRaise> findPendingHandRaises(@Param("sessionId") Long sessionId);
    
    @Query("SELECT COALESCE(MAX(hr.ordre), 0) FROM HandRaise hr WHERE hr.session.id = :sessionId AND hr.statut = 'PENDING'")
    Integer getMaxOrdre(@Param("sessionId") Long sessionId);
    
    void deleteBySessionId(Long sessionId);
}
