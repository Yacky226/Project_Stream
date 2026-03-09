package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.HandRaiseDTO;

import java.util.List;

public interface HandRaiseServiceInterface {
    
    HandRaiseDTO raiseHand(Long etudiantId, Long sessionId);
    
    HandRaiseDTO lowerHand(Long etudiantId, Long sessionId);
    
    HandRaiseDTO grantSpeaking(Long handRaiseId);
    
    HandRaiseDTO completeSpeaking(Long handRaiseId);
    
    List<HandRaiseDTO> getPendingHandRaises(Long sessionId);
    
    HandRaiseDTO getCurrentSpeaker(Long sessionId);
    
    void clearHandRaises(Long sessionId);
}
