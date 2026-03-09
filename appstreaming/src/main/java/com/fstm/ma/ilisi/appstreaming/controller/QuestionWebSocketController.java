package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.QuestionDTO;
import com.fstm.ma.ilisi.appstreaming.service.QuestionServiceInterface;
import jakarta.validation.Valid;
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
public class QuestionWebSocketController {
    
    private final QuestionServiceInterface questionService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * Créer une nouvelle question via WebSocket
     */
    @MessageMapping("/question.create/{sessionId}")
    public void createQuestion(@DestinationVariable Long sessionId, QuestionDTO questionDTO) {
        questionDTO.setSessionId(sessionId);
        QuestionDTO created = questionService.createQuestion(questionDTO);
        
        // Diffuser la nouvelle question à tous les participants
        messagingTemplate.convertAndSend("/topic/questions/" + sessionId, created);
    }
    
    /**
     * Voter pour une question via WebSocket
     */
    @MessageMapping("/question.upvote/{sessionId}/{questionId}")
    public void upvoteQuestion(
            @DestinationVariable Long sessionId,
            @DestinationVariable Long questionId,
            Long userId) {
        QuestionDTO updated = questionService.upvoteQuestion(questionId, userId);
        
        // Diffuser la mise à jour
        messagingTemplate.convertAndSend("/topic/questions/" + sessionId + "/update", updated);
    }
    
    /**
     * Marquer une question comme répondue
     */
    @MessageMapping("/question.answered/{sessionId}/{questionId}")
    public void markAsAnswered(
            @DestinationVariable Long sessionId,
            @DestinationVariable Long questionId) {
        QuestionDTO updated = questionService.markAsAnswered(questionId);
        
        // Diffuser la mise à jour
        messagingTemplate.convertAndSend("/topic/questions/" + sessionId + "/update", updated);
    }
}

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class QuestionRestController {
    
    private final QuestionServiceInterface questionService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    /**
     * Créer une nouvelle question (REST alternative)
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDTO> createQuestion(@Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO created = questionService.createQuestion(questionDTO);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/questions/" + questionDTO.getSessionId(), created);
        
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    
    /**
     * Récupérer toutes les questions d'une session
     */
    @GetMapping("/session/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuestionDTO>> getQuestionsBySession(
            @PathVariable Long sessionId,
            @RequestParam(required = false) Long userId) {
        List<QuestionDTO> questions;
        if (userId != null) {
            questions = questionService.getQuestionsBySession(sessionId, userId);
        } else {
            questions = questionService.getQuestionsBySession(sessionId);
        }
        return ResponseEntity.ok(questions);
    }
    
    /**
     * Récupérer les questions non répondues
     */
    @GetMapping("/session/{sessionId}/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuestionDTO>> getPendingQuestions(@PathVariable Long sessionId) {
        List<QuestionDTO> questions = questionService.getPendingQuestions(sessionId);
        return ResponseEntity.ok(questions);
    }
    
    /**
     * Voter pour une question
     */
    @PostMapping("/{questionId}/upvote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDTO> upvoteQuestion(
            @PathVariable Long questionId,
            @RequestParam Long userId) {
        QuestionDTO updated = questionService.upvoteQuestion(questionId, userId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/questions/" + updated.getSessionId() + "/update", updated);
        
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Retirer son vote
     */
    @DeleteMapping("/{questionId}/upvote")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDTO> removeUpvote(
            @PathVariable Long questionId,
            @RequestParam Long userId) {
        QuestionDTO updated = questionService.removeUpvote(questionId, userId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/questions/" + updated.getSessionId() + "/update", updated);
        
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Marquer une question comme répondue
     */
    @PutMapping("/{questionId}/answered")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<QuestionDTO> markAsAnswered(@PathVariable Long questionId) {
        QuestionDTO updated = questionService.markAsAnswered(questionId);
        
        // Notifier via WebSocket
        messagingTemplate.convertAndSend("/topic/questions/" + updated.getSessionId() + "/update", updated);
        
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Supprimer une question
     */
    @DeleteMapping("/{questionId}")
    @PreAuthorize("hasAuthority('ENSEIGNANT') or hasAuthority('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
