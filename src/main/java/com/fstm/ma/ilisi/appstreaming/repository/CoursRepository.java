package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {
    List<Cours> findByCategorieContainingIgnoreCase(String categorie);
    List<Cours> findByEnseignantId(Long enseignantId);
}
