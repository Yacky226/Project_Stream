package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;

@Repository
public interface SessionStreamingRepository extends JpaRepository<SessionStreaming, Long> {
    List<SessionStreaming> findByCoursId(Long coursId);
    List<SessionStreaming> findByEstEnDirectTrue();
}
