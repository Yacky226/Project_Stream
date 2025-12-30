package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    
    boolean existsByQuestionIdAndUtilisateurId(Long questionId, Long utilisateurId);
    
    Optional<Vote> findByQuestionIdAndUtilisateurId(Long questionId, Long utilisateurId);
    
    Long countByQuestionId(Long questionId);
    
    void deleteByQuestionId(Long questionId);
}
