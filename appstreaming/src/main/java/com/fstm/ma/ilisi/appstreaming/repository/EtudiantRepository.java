package com.fstm.ma.ilisi.appstreaming.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;


@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByEmail(String email);
}

