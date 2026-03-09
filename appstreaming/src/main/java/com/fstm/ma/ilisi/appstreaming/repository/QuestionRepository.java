package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    List<Question> findBySessionIdOrderByVotesDescTimestampAsc(Long sessionId);
    
    List<Question> findBySessionIdAndEstRepondueFalseOrderByVotesDescTimestampAsc(Long sessionId);
    
    @Query("SELECT q FROM Question q WHERE q.session.id = :sessionId AND q.estRepondue = :repondue ORDER BY q.votes DESC, q.timestamp ASC")
    List<Question> findBySessionAndStatus(@Param("sessionId") Long sessionId, @Param("repondue") Boolean repondue);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.session.id = :sessionId")
    Long countBySessionId(@Param("sessionId") Long sessionId);
    
    void deleteBySessionId(Long sessionId);
}
