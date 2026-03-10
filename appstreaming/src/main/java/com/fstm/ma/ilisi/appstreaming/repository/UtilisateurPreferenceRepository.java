package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.UtilisateurPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilisateurPreferenceRepository extends JpaRepository<UtilisateurPreference, Long> {
    Optional<UtilisateurPreference> findByUtilisateurId(Long utilisateurId);
}
