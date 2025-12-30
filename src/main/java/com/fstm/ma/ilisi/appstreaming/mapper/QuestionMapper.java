package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Question;
import com.fstm.ma.ilisi.appstreaming.model.dto.QuestionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface QuestionMapper {
    
    @Mapping(source = "auteur.id", target = "auteurId")
    @Mapping(source = "auteur.nom", target = "auteurNom")
    @Mapping(source = "auteur.photoProfil", target = "auteurPhoto")
    @Mapping(source = "session.id", target = "sessionId")
    @Mapping(target = "userHasVoted", ignore = true)
    QuestionDTO toDto(Question question);
    
    @Mapping(target = "auteur", ignore = true)
    @Mapping(source = "sessionId", target = "session.id")
    @Mapping(target = "votesUtilisateurs", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contenu", ignore = true)
    @Mapping(target = "timestamp", ignore = true)
    @Mapping(target = "estRepondue", ignore = true)
    @Mapping(target = "votes", ignore = true)
    Question toEntity(QuestionDTO questionDTO);
    
    List<QuestionDTO> toDtoList(List<Question> questions);
}
