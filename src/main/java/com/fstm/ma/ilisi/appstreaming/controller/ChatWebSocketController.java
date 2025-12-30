package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.ChatMessageDTO;
import com.fstm.ma.ilisi.appstreaming.service.ChatServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    
    private final ChatServiceInterface chatService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * Recevoir un message via WebSocket et le diffuser à tous les participants
     */
    @MessageMapping("/chat.send/{sessionId}")
    @SendTo("/topic/chat/{sessionId}")
    public ChatMessageDTO sendMessage(@DestinationVariable Long sessionId, ChatMessageDTO message) {
        // Sauvegarder le message en base de données
        message.setSessionId(sessionId);
        ChatMessageDTO saved = chatService.saveMessage(message);
        return saved;
    }
}

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class ChatRestController {
    
    private final ChatServiceInterface chatService;
    
    /**
     * Récupérer l'historique des messages d'une session
     */
    @GetMapping("/history/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageDTO> getChatHistory(@PathVariable Long sessionId) {
        return chatService.getMessagesBySession(sessionId);
    }
    
    /**
     * Récupérer les messages récents depuis une date donnée
     */
    @GetMapping("/recent/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public List<ChatMessageDTO> getRecentMessages(
            @PathVariable Long sessionId,
            @RequestParam String since) {
        LocalDateTime sinceDate = LocalDateTime.parse(since);
        return chatService.getRecentMessages(sessionId, sinceDate);
    }
    
    /**
     * Supprimer tous les messages d'une session
     */
    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public void deleteChatHistory(@PathVariable Long sessionId) {
        chatService.deleteMessagesBySession(sessionId);
    }
}
