package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.QuestionDTO;

import java.util.List;

public interface QuestionServiceInterface {
    
    QuestionDTO createQuestion(QuestionDTO questionDTO);
    
    QuestionDTO getQuestionById(Long id);
    
    List<QuestionDTO> getQuestionsBySession(Long sessionId);
    
    List<QuestionDTO> getQuestionsBySession(Long sessionId, Long userId);
    
    List<QuestionDTO> getPendingQuestions(Long sessionId);
    
    QuestionDTO upvoteQuestion(Long questionId, Long userId);
    
    QuestionDTO removeUpvote(Long questionId, Long userId);
    
    QuestionDTO markAsAnswered(Long questionId);
    
    void deleteQuestion(Long questionId);
}
