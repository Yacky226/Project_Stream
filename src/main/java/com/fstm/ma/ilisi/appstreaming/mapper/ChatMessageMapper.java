package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.ChatMessage;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatMessageDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    
    @Mapping(source = "expediteur.id", target = "expediteurId")
    @Mapping(source = "expediteur.nom", target = "expediteurNom")
    @Mapping(source = "expediteur.photoProfil", target = "expediteurPhoto")
    @Mapping(source = "expediteur.role", target = "expediteurRole")
    @Mapping(source = "session.id", target = "sessionId")
    ChatMessageDTO toDto(ChatMessage chatMessage);
    
    @Mapping(target = "expediteur", ignore = true)
    @Mapping(source = "sessionId", target = "session.id")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "timestamp", ignore = true)
    ChatMessage toEntity(ChatMessageDTO chatMessageDTO);
    
    List<ChatMessageDTO> toDtoList(List<ChatMessage> chatMessages);
}
