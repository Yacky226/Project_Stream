package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.ChatMessageDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatServiceInterface {
    
    ChatMessageDTO saveMessage(ChatMessageDTO chatMessageDTO);
    
    List<ChatMessageDTO> getMessagesBySession(Long sessionId);
    
    List<ChatMessageDTO> getRecentMessages(Long sessionId, LocalDateTime since);
    
    void deleteMessagesBySession(Long sessionId);
}
