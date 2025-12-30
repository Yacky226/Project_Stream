package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.ChatMessageMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.ChatMessage;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatMessageDTO;
import com.fstm.ma.ilisi.appstreaming.repository.ChatMessageRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService implements ChatServiceInterface {
    
    private final ChatMessageRepository chatMessageRepository;
    private final SessionStreamingRepository sessionStreamingRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ChatMessageMapper chatMessageMapper;
    
    @Override
    public ChatMessageDTO saveMessage(ChatMessageDTO chatMessageDTO) {
        Utilisateur expediteur = utilisateurRepository.findById(chatMessageDTO.getExpediteurId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + chatMessageDTO.getExpediteurId()));
        
        SessionStreaming session = sessionStreamingRepository.findById(chatMessageDTO.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + chatMessageDTO.getSessionId()));
        
        ChatMessage chatMessage = chatMessageMapper.toEntity(chatMessageDTO);
        chatMessage.setExpediteur(expediteur);
        chatMessage.setSession(session);
        chatMessage.setTimestamp(LocalDateTime.now());
        
        ChatMessage saved = chatMessageRepository.save(chatMessage);
        return chatMessageMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessagesBySession(Long sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        return chatMessageMapper.toDtoList(messages);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRecentMessages(Long sessionId, LocalDateTime since) {
        List<ChatMessage> messages = chatMessageRepository.findRecentMessages(sessionId, since);
        return chatMessageMapper.toDtoList(messages);
    }
    
    @Override
    public void deleteMessagesBySession(Long sessionId) {
        chatMessageRepository.deleteBySessionId(sessionId);
    }
}
