package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.QuestionMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import com.fstm.ma.ilisi.appstreaming.model.dto.QuestionDTO;
import com.fstm.ma.ilisi.appstreaming.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuestionService implements QuestionServiceInterface {
    
    private final QuestionRepository questionRepository;
    private final VoteRepository voteRepository;
    private final SessionStreamingRepository sessionStreamingRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final QuestionMapper questionMapper;
    
    @Override
    public QuestionDTO createQuestion(QuestionDTO questionDTO) {
        Utilisateur auteur = utilisateurRepository.findById(questionDTO.getAuteurId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + questionDTO.getAuteurId()));
        
        SessionStreaming session = sessionStreamingRepository.findById(questionDTO.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + questionDTO.getSessionId()));
        
        Question question = questionMapper.toEntity(questionDTO);
        question.setAuteur(auteur);
        question.setSession(session);
        question.setTimestamp(LocalDateTime.now());
        question.setVotes(0);
        question.setEstRepondue(false);
        
        Question saved = questionRepository.save(question);
        return questionMapper.toDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return questionMapper.toDto(question);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsBySession(Long sessionId) {
        List<Question> questions = questionRepository.findBySessionIdOrderByVotesDescTimestampAsc(sessionId);
        return questionMapper.toDtoList(questions);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestionsBySession(Long sessionId, Long userId) {
        List<Question> questions = questionRepository.findBySessionIdOrderByVotesDescTimestampAsc(sessionId);
        return questions.stream().map(question -> {
            QuestionDTO dto = questionMapper.toDto(question);
            dto.setUserHasVoted(voteRepository.existsByQuestionIdAndUtilisateurId(question.getId(), userId));
            return dto;
        }).collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<QuestionDTO> getPendingQuestions(Long sessionId) {
        List<Question> questions = questionRepository.findBySessionIdAndEstRepondueFalseOrderByVotesDescTimestampAsc(sessionId);
        return questionMapper.toDtoList(questions);
    }
    
    @Override
    public QuestionDTO upvoteQuestion(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        
        // Vérifier si l'utilisateur a déjà voté
        if (voteRepository.existsByQuestionIdAndUtilisateurId(questionId, userId)) {
            throw new IllegalStateException("User has already voted for this question");
        }
        
        Utilisateur utilisateur = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Créer le vote
        Vote vote = new Vote();
        vote.setQuestion(question);
        vote.setUtilisateur(utilisateur);
        vote.setTimestamp(LocalDateTime.now());
        voteRepository.save(vote);
        
        // Incrémenter le compteur de votes
        question.setVotes(question.getVotes() + 1);
        Question updated = questionRepository.save(question);
        
        return questionMapper.toDto(updated);
    }
    
    @Override
    public QuestionDTO removeUpvote(Long questionId, Long userId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        
        Vote vote = voteRepository.findByQuestionIdAndUtilisateurId(questionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vote not found"));
        
        voteRepository.delete(vote);
        
        // Décrémenter le compteur de votes
        question.setVotes(Math.max(0, question.getVotes() - 1));
        Question updated = questionRepository.save(question);
        
        return questionMapper.toDto(updated);
    }
    
    @Override
    public QuestionDTO markAsAnswered(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        
        question.setEstRepondue(true);
        Question updated = questionRepository.save(question);
        
        return questionMapper.toDto(updated);
    }
    
    @Override
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question not found with id: " + questionId);
        }
        questionRepository.deleteById(questionId);
    }
}
