package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.ChatMessage;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatMessageDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ChatMessageMapper {
    
    public ChatMessageDTO toDto(ChatMessage chatMessage) {
        if (chatMessage == null) return null;
        
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(chatMessage.getId());
        dto.setContenu(chatMessage.getContenu());
        dto.setTimestamp(chatMessage.getTimestamp());
        
        if (chatMessage.getExpediteur() != null) {
            dto.setExpediteurId(chatMessage.getExpediteur().getId());
            dto.setExpediteurNom(chatMessage.getExpediteur().getNom());
            dto.setExpediteurPhoto(chatMessage.getExpediteur().getPhotoProfil());
            dto.setExpediteurRole(chatMessage.getExpediteur().getRole().name());
        }
        
        if (chatMessage.getSession() != null) {
            dto.setSessionId(chatMessage.getSession().getId());
        }
        
        return dto;
    }
    
    public ChatMessage toEntity(ChatMessageDTO chatMessageDTO) {
        if (chatMessageDTO == null) return null;
        
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContenu(chatMessageDTO.getContenu());
        
        return chatMessage;
    }
    
    public List<ChatMessageDTO> toDtoList(List<ChatMessage> chatMessages) {
        if (chatMessages == null) return null;
        return chatMessages.stream().map(this::toDto).collect(Collectors.toList());
    }
}
