package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Historique;

@Repository
public interface HistoriqueRepository extends JpaRepository<Historique, Long> {
    List<Historique> findByEtudiantId(Long etudiantId);
    List<Historique> findByCoursId(Long coursId);
}
