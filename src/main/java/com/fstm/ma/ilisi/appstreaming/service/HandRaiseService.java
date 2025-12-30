package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.HandRaiseMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import com.fstm.ma.ilisi.appstreaming.model.dto.HandRaiseDTO;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.HandRaiseRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class HandRaiseService implements HandRaiseServiceInterface {
    
    private final HandRaiseRepository handRaiseRepository;
    private final EtudiantRepository etudiantRepository;
    private final SessionStreamingRepository sessionStreamingRepository;
    private final HandRaiseMapper handRaiseMapper;
    
    @Override
    public HandRaiseDTO raiseHand(Long etudiantId, Long sessionId) {
        // Vérifier si l'étudiant a déjà la main levée
        if (handRaiseRepository.existsBySessionIdAndEtudiantIdAndStatut(sessionId, etudiantId, HandRaiseStatus.PENDING)) {
            throw new IllegalStateException("Student already has hand raised");
        }
        
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + etudiantId));
        
        SessionStreaming session = sessionStreamingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));
        
        // Obtenir le prochain ordre
        Integer maxOrdre = handRaiseRepository.getMaxOrdre(sessionId);
        
        HandRaise handRaise = new HandRaise();
        handRaise.setEtudiant(etudiant);
        handRaise.setSession(session);
        handRaise.setTimestampDemande(LocalDateTime.now());
        handRaise.setStatut(HandRaiseStatus.PENDING);
        handRaise.setOrdre(maxOrdre + 1);
        
        HandRaise saved = handRaiseRepository.save(handRaise);
        return handRaiseMapper.toDto(saved);
    }
    
    @Override
    public HandRaiseDTO lowerHand(Long etudiantId, Long sessionId) {
        HandRaise handRaise = handRaiseRepository.findBySessionIdAndEtudiantIdAndStatut(sessionId, etudiantId, HandRaiseStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("No pending hand raise found for this student"));
        
        handRaise.setStatut(HandRaiseStatus.CANCELLED);
        handRaise.setTimestampFin(LocalDateTime.now());
        
        HandRaise updated = handRaiseRepository.save(handRaise);
        return handRaiseMapper.toDto(updated);
    }
    
    @Override
    public HandRaiseDTO grantSpeaking(Long handRaiseId) {
        HandRaise handRaise = handRaiseRepository.findById(handRaiseId)
                .orElseThrow(() -> new ResourceNotFoundException("HandRaise not found with id: " + handRaiseId));
        
        if (handRaise.getStatut() != HandRaiseStatus.PENDING) {
            throw new IllegalStateException("HandRaise is not in pending state");
        }
        
        handRaise.setStatut(HandRaiseStatus.SPEAKING);
        handRaise.setTimestampAccorde(LocalDateTime.now());
        
        HandRaise updated = handRaiseRepository.save(handRaise);
        return handRaiseMapper.toDto(updated);
    }
    
    @Override
    public HandRaiseDTO completeSpeaking(Long handRaiseId) {
        HandRaise handRaise = handRaiseRepository.findById(handRaiseId)
                .orElseThrow(() -> new ResourceNotFoundException("HandRaise not found with id: " + handRaiseId));
        
        handRaise.setStatut(HandRaiseStatus.COMPLETED);
        handRaise.setTimestampFin(LocalDateTime.now());
        
        HandRaise updated = handRaiseRepository.save(handRaise);
        return handRaiseMapper.toDto(updated);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<HandRaiseDTO> getPendingHandRaises(Long sessionId) {
        List<HandRaise> handRaises = handRaiseRepository.findPendingHandRaises(sessionId);
        return handRaiseMapper.toDtoList(handRaises);
    }
    
    @Override
    @Transactional(readOnly = true)
    public HandRaiseDTO getCurrentSpeaker(Long sessionId) {
        List<HandRaise> speakers = handRaiseRepository.findBySessionIdAndStatutOrderByOrdreAsc(sessionId, HandRaiseStatus.SPEAKING);
        if (speakers.isEmpty()) {
            return null;
        }
        return handRaiseMapper.toDto(speakers.get(0));
    }
    
    @Override
    public void clearHandRaises(Long sessionId) {
        handRaiseRepository.deleteBySessionId(sessionId);
    }
}
