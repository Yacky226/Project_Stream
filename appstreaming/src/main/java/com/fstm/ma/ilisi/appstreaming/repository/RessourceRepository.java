package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Ressource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RessourceRepository extends JpaRepository<Ressource, Long> {
    
    List<Ressource> findByLeconId(Long leconId);
    
    List<Ressource> findByCoursId(Long coursId);
}
