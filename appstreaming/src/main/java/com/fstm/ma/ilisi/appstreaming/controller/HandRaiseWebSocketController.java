package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.HandRaiseDTO;
import com.fstm.ma.ilisi.appstreaming.service.HandRaiseServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class HandRaiseWebSocketController {
    
    private final HandRaiseServiceInterface handRaiseService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * Lever la main via WebSocket
     */
    @MessageMapping("/handraise.raise/{sessionId}")
    public void raiseHand(@DestinationVariable Long sessionId, Long etudiantId) {
        HandRaiseDTO handRaise = handRaiseService.raiseHand(etudiantId, sessionId);
        
        // Diffuser à tous les participants
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId, handRaise);
        
        // Envoyer la file d'attente mise à jour
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/queue", queue);
    }
    
    /**
     * Baisser la main via WebSocket
     */
    @MessageMapping("/handraise.lower/{sessionId}")
    public void lowerHand(@DestinationVariable Long sessionId, Long etudiantId) {
        HandRaiseDTO handRaise = handRaiseService.lowerHand(etudiantId, sessionId);
        
        // Notifier les participants
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/lowered", handRaise);
        
        // Envoyer la file d'attente mise à jour
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/queue", queue);
    }
    
    /**
     * Accorder la parole via WebSocket
     */
    @MessageMapping("/handraise.grant/{sessionId}")
    public void grantSpeaking(@DestinationVariable Long sessionId, Long handRaiseId) {
        HandRaiseDTO handRaise = handRaiseService.grantSpeaking(handRaiseId);
        
        // Notifier que la parole est accordée
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/granted", handRaise);
        
        // Envoyer la file d'attente mise à jour
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/queue", queue);
    }
}

@RestController
@RequestMapping("/api/handraises")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class HandRaiseRestController {
    
    private final HandRaiseServiceInterface handRaiseService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * Lever la main (REST alternative)
     */
    @PostMapping("/raise")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<HandRaiseDTO> raiseHand(
            @RequestParam Long etudiantId,
            @RequestParam Long sessionId) {
        HandRaiseDTO handRaise = handRaiseService.raiseHand(etudiantId, sessionId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId, handRaise);
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/queue", queue);
        
        return new ResponseEntity<>(handRaise, HttpStatus.CREATED);
    }
    
    /**
     * Baisser la main
     */
    @PostMapping("/lower")
    @PreAuthorize("hasAuthority('ETUDIANT')")
    public ResponseEntity<HandRaiseDTO> lowerHand(
            @RequestParam Long etudiantId,
            @RequestParam Long sessionId) {
        HandRaiseDTO handRaise = handRaiseService.lowerHand(etudiantId, sessionId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/lowered", handRaise);
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/queue", queue);
        
        return ResponseEntity.ok(handRaise);
    }
    
    /**
     * Accorder la parole à un étudiant
     */
    @PostMapping("/{handRaiseId}/grant")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<HandRaiseDTO> grantSpeaking(@PathVariable Long handRaiseId) {
        HandRaiseDTO handRaise = handRaiseService.grantSpeaking(handRaiseId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/handraises/" + handRaise.getSessionId() + "/granted", handRaise);
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(handRaise.getSessionId());
        messagingTemplate.convertAndSend("/topic/handraises/" + handRaise.getSessionId() + "/queue", queue);
        
        return ResponseEntity.ok(handRaise);
    }
    
    /**
     * Terminer la prise de parole
     */
    @PostMapping("/{handRaiseId}/complete")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<HandRaiseDTO> completeSpeaking(@PathVariable Long handRaiseId) {
        HandRaiseDTO handRaise = handRaiseService.completeSpeaking(handRaiseId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/handraises/" + handRaise.getSessionId() + "/completed", handRaise);
        
        return ResponseEntity.ok(handRaise);
    }
    
    /**
     * Récupérer la file d'attente des mains levées
     */
    @GetMapping("/session/{sessionId}/queue")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HandRaiseDTO>> getPendingQueue(@PathVariable Long sessionId) {
        List<HandRaiseDTO> queue = handRaiseService.getPendingHandRaises(sessionId);
        return ResponseEntity.ok(queue);
    }
    
    /**
     * Récupérer l'étudiant qui parle actuellement
     */
    @GetMapping("/session/{sessionId}/speaker")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<HandRaiseDTO> getCurrentSpeaker(@PathVariable Long sessionId) {
        HandRaiseDTO speaker = handRaiseService.getCurrentSpeaker(sessionId);
        return ResponseEntity.ok(speaker);
    }
    
    /**
     * Effacer toutes les mains levées d'une session
     */
    @DeleteMapping("/session/{sessionId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> clearHandRaises(@PathVariable Long sessionId) {
        handRaiseService.clearHandRaises(sessionId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/handraises/" + sessionId + "/cleared", true);
        
        return ResponseEntity.noContent().build();
    }
}
