package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;

@Repository
public interface SessionStreamingRepository extends JpaRepository<SessionStreaming, Long> {

    // Optimisation : Charge les sessions avec cours et enseignant
    @EntityGraph(attributePaths = {"cours", "enseignant"})
    List<SessionStreaming> findByCoursId(Long coursId);
    
    // Optimisation : Charge les sessions actives avec relations
    @EntityGraph(attributePaths = {"cours", "enseignant"})
    List<SessionStreaming> findByStatus(StreamStatus status);
    
    // Trouver les sessions actives (en direct)
    default List<SessionStreaming> findActiveSessions() {
        return findByStatus(StreamStatus.LIVE);
    }
    
    // Trouver par clé de stream
    Optional<SessionStreaming> findByStreamKey(String streamKey);
    
    // Trouver les sessions avec enregistrement disponible
    @Query("SELECT s FROM SessionStreaming s WHERE s.recordingUrl IS NOT NULL")
    List<SessionStreaming> findSessionsWithRecording();
    
    // Trouver les sessions d'un enseignant
    @Query("SELECT s FROM SessionStreaming s WHERE s.enseignant.id = :enseignantId")
    List<SessionStreaming> findByEnseignantId(Long enseignantId);
    
    // Trouver les sessions à venir (non démarrées)
    @Query("SELECT s FROM SessionStreaming s WHERE s.status = 'CREATED' AND s.dateHeure > CURRENT_TIMESTAMP")
    List<SessionStreaming> findUpcomingSessions();
    
    // Vérifier si un cours a des sessions en direct
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM SessionStreaming s WHERE s.cours.id = :coursId AND s.status = 'LIVE'")
    boolean existsLiveSessionByCoursId(Long coursId);
    
    // Statistiques admin
    @Query("SELECT COUNT(s) FROM SessionStreaming s WHERE s.dateHeure > :date")
    Long countByDateHeureAfter(java.time.LocalDateTime date);
}