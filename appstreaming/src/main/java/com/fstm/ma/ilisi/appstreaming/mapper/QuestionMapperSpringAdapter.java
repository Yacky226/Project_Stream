package com.fstm.ma.ilisi.appstreaming.mapper;

import com.fstm.ma.ilisi.appstreaming.model.bo.Question;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.dto.QuestionDTO;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Primary
public class QuestionMapperSpringAdapter implements QuestionMapper {

    @Override
    public QuestionDTO toDto(Question question) {
        if (question == null) {
            return null;
        }

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setContenu(question.getContenu());
        dto.setTimestamp(question.getTimestamp());
        dto.setVotes(question.getVotes());
        dto.setEstRepondue(question.getEstRepondue());
        dto.setUserHasVoted(false);

        if (question.getAuteur() != null) {
            dto.setAuteurId(question.getAuteur().getId());
            dto.setAuteurNom(question.getAuteur().getNom());
            dto.setAuteurPhoto(question.getAuteur().getPhotoProfil());
        }

        if (question.getSession() != null) {
            dto.setSessionId(question.getSession().getId());
        }

        return dto;
    }

    @Override
    public Question toEntity(QuestionDTO questionDTO) {
        if (questionDTO == null) {
            return null;
        }

        Question entity = new Question();
        entity.setId(questionDTO.getId());
        entity.setContenu(questionDTO.getContenu());
        entity.setTimestamp(questionDTO.getTimestamp());
        entity.setVotes(questionDTO.getVotes());
        entity.setEstRepondue(questionDTO.getEstRepondue());

        if (questionDTO.getSessionId() != null) {
            SessionStreaming session = new SessionStreaming();
            session.setId(questionDTO.getSessionId());
            entity.setSession(session);
        }

        return entity;
    }

    @Override
    public List<QuestionDTO> toDtoList(List<Question> questions) {
        if (questions == null) {
            return Collections.emptyList();
        }
        return questions.stream().map(this::toDto).collect(Collectors.toList());
    }
}
