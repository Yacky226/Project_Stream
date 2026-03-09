package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);
    
    // Version paginée pour l'historique
    Page<ChatMessage> findBySessionIdOrderByTimestampDesc(Long sessionId, Pageable pageable);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.session.id = :sessionId AND cm.timestamp >= :since ORDER BY cm.timestamp ASC")
    List<ChatMessage> findRecentMessages(@Param("sessionId") Long sessionId, @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.session.id = :sessionId")
    Long countBySessionId(@Param("sessionId") Long sessionId);
    
    void deleteBySessionId(Long sessionId);
}
