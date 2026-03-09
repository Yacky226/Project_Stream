package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.mapper.HistoriqueMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Historique;
import com.fstm.ma.ilisi.appstreaming.model.dto.HistoriqueDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.HistoriqueRepository;

@Service
public class HistoriqueService implements HistoriqueServiceInterface {

    private final HistoriqueRepository historiqueRepository;
    private final HistoriqueMapper historiqueMapper;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;

    public HistoriqueService(HistoriqueRepository historiqueRepository, HistoriqueMapper historiqueMapper,
                                  EtudiantRepository etudiantRepository, CoursRepository coursRepository) {
        this.historiqueRepository = historiqueRepository;
        this.historiqueMapper = historiqueMapper;
        this.etudiantRepository = etudiantRepository;
        this.coursRepository = coursRepository;
    }

    @Override
    public HistoriqueDTO enregistrerVisionnage(HistoriqueDTO dto) {
        Etudiant etudiant = etudiantRepository.findById(dto.getEtudiantId())
                .orElseThrow(() -> new RuntimeException("Étudiant introuvable"));
        Cours cours = coursRepository.findById(dto.getCoursId())
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        Historique historique = historiqueMapper.toEntity(dto, etudiant, cours);
        return historiqueMapper.toDTO(historiqueRepository.save(historique));
    }

    @Override
    public List<HistoriqueDTO> getHistoriqueParEtudiant(Long etudiantId) {
        return historiqueRepository.findByEtudiantId(etudiantId)
                .stream()
                .map(historiqueMapper::toDTO)
                .collect(Collectors.toList());
    }
    public List<HistoriqueDTO> getHistoriqueParEtudiantEmail(String email) {
        Etudiant etudiant = etudiantRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Etudiant introuvable avec email " + email));
        return historiqueRepository.findByEtudiantId(etudiant.getId())
            .stream()
            .map(historiqueMapper::toDTO)
            .collect(Collectors.toList());
    }

}