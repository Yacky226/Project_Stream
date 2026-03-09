package com.fstm.ma.ilisi.appstreaming.repository;

import com.fstm.ma.ilisi.appstreaming.model.bo.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("Tests du repository SessionStreamingRepository")
class SessionStreamingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SessionStreamingRepository sessionStreamingRepository;

    private Cours cours;
    private Enseignant enseignant;
    private SessionStreaming session1;
    private SessionStreaming session2;

    @BeforeEach
    void setUp() {
        // Créer un enseignant
        enseignant = new Enseignant();
        enseignant.setNom("Dupont");
        enseignant.setPrenom("Jean");
        enseignant.setEmail("jean.dupont@test.com");
        enseignant.setPassword("password123");
        enseignant.setRole(Role.ENSEIGNANT);
        enseignant.setSpecialite("Informatique");
        enseignant = entityManager.persist(enseignant);

        // Créer un cours
        cours = new Cours();
        cours.setTitre("Java Spring Boot");
        cours.setDescription("Cours de développement Spring Boot");
        cours.setCategorie("Informatique");
        cours.setHoraire(LocalDateTime.now());
        cours.setEnseignant(enseignant);
        cours = entityManager.persist(cours);

        // Créer des sessions
        session1 = new SessionStreaming();
        session1.setCours(cours);
        session1.setEnseignant(enseignant);
        session1.setDateHeure(LocalDateTime.now().plusDays(1));
        session1.setStatus(StreamStatus.CREATED);
        session1.setStreamKey("stream-key-1");
        session1.setVideoUrl("rtmp://test.com/live/stream1");
        session1 = entityManager.persist(session1);

        session2 = new SessionStreaming();
        session2.setCours(cours);
        session2.setEnseignant(enseignant);
        session2.setDateHeure(LocalDateTime.now().plusDays(2));
        session2.setStatus(StreamStatus.LIVE);
        session2.setStreamKey("stream-key-2");
        session2.setVideoUrl("rtmp://test.com/live/stream2");
        session2 = entityManager.persist(session2);

        entityManager.flush();
    }

    @Test
    @DisplayName("findAll - Retourne toutes les sessions")
    void findAll_ReturnsAllSessions() {
        // When
        List<SessionStreaming> sessions = sessionStreamingRepository.findAll();

        // Then
        assertThat(sessions).hasSize(2);
        assertThat(sessions).extracting(SessionStreaming::getStreamKey)
                .containsExactlyInAnyOrder("stream-key-1", "stream-key-2");
    }

    @Test
    @DisplayName("findById - Session existante")
    void findById_SessionExists_ReturnsSession() {
        // When
        Optional<SessionStreaming> found = sessionStreamingRepository.findById(session1.getId());

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getStreamKey()).isEqualTo("stream-key-1");
        assertThat(found.get().getStatus()).isEqualTo(StreamStatus.CREATED);
    }

    @Test
    @DisplayName("findById - Session inexistante")
    void findById_SessionNotFound_ReturnsEmpty() {
        // When
        Optional<SessionStreaming> found = sessionStreamingRepository.findById(999L);

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findByStatus - Trouve les sessions LIVE")
    void findByStatus_LiveSessions_ReturnsLiveSessions() {
        // When
        List<SessionStreaming> liveSessions = sessionStreamingRepository.findByStatus(StreamStatus.LIVE);

        // Then
        assertThat(liveSessions).hasSize(1);
        assertThat(liveSessions.get(0).getStreamKey()).isEqualTo("stream-key-2");
        assertThat(liveSessions.get(0).getStatus()).isEqualTo(StreamStatus.LIVE);
    }

    @Test
    @DisplayName("findByCours_Id - Trouve les sessions d'un cours")
    void findByCours_Id_ReturnsCoursSessions() {
        // When
        List<SessionStreaming> sessions = sessionStreamingRepository.findByCoursId(cours.getId());

        // Then
        assertThat(sessions).hasSize(2);
        assertThat(sessions).allMatch(s -> s.getCours().getId().equals(cours.getId()));
    }

    @Test
    @DisplayName("findByCours_Id avec pagination")
    void findByCours_IdWithPageable_ReturnsPaginatedSessions() {
        // Given
        Pageable pageable = PageRequest.of(0, 1);

        // When
        Page<SessionStreaming> page = sessionStreamingRepository.findByCoursId(cours.getId(), pageable);

        // Then
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getTotalPages()).isEqualTo(2);
    }

    @Test
    @DisplayName("findByEnseignant_Id - Trouve les sessions d'un enseignant")
    void findByEnseignant_Id_ReturnsEnseignantSessions() {
        // When
        List<SessionStreaming> sessions = sessionStreamingRepository.findByEnseignantId(enseignant.getId());

        // Then
        assertThat(sessions).hasSize(2);
        assertThat(sessions).allMatch(s -> s.getEnseignant().getId().equals(enseignant.getId()));
    }

    @Test
    @DisplayName("save - Créer une nouvelle session")
    void save_NewSession_SavesSuccessfully() {
        // Given
        SessionStreaming newSession = new SessionStreaming();
        newSession.setCours(cours);
        newSession.setEnseignant(enseignant);
        newSession.setDateHeure(LocalDateTime.now().plusDays(3));
        newSession.setStatus(StreamStatus.CREATED);
        newSession.setStreamKey("stream-key-3");
        newSession.setVideoUrl("rtmp://test.com/live/stream3");

        // When
        SessionStreaming saved = sessionStreamingRepository.save(newSession);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getStreamKey()).isEqualTo("stream-key-3");
        
        List<SessionStreaming> allSessions = sessionStreamingRepository.findAll();
        assertThat(allSessions).hasSize(3);
    }

    @Test
    @DisplayName("save - Mettre à jour une session existante")
    void save_ExistingSession_UpdatesSuccessfully() {
        // Given
        session1.setStatus(StreamStatus.LIVE);
        session1.setVideoUrl("rtmp://updated.com/live/stream1");

        // When
        SessionStreaming updated = sessionStreamingRepository.save(session1);

        // Then
        assertThat(updated.getId()).isEqualTo(session1.getId());
        assertThat(updated.getStatus()).isEqualTo(StreamStatus.LIVE);
        assertThat(updated.getVideoUrl()).isEqualTo("rtmp://updated.com/live/stream1");
    }

    @Test
    @DisplayName("delete - Supprimer une session")
    void delete_ExistingSession_DeletesSuccessfully() {
        // Given
        Long sessionId = session1.getId();

        // When
        sessionStreamingRepository.delete(session1);
        entityManager.flush();

        // Then
        Optional<SessionStreaming> found = sessionStreamingRepository.findById(sessionId);
        assertThat(found).isEmpty();
        
        List<SessionStreaming> remainingSessions = sessionStreamingRepository.findAll();
        assertThat(remainingSessions).hasSize(1);
    }

    @Test
    @DisplayName("deleteById - Supprimer par ID")
    void deleteById_ExistingId_DeletesSuccessfully() {
        // Given
        Long sessionId = session1.getId();

        // When
        sessionStreamingRepository.deleteById(sessionId);
        entityManager.flush();

        // Then
        assertThat(sessionStreamingRepository.findById(sessionId)).isEmpty();
    }

    @Test
    @DisplayName("findAll avec pagination - Page 0")
    void findAllWithPageable_FirstPage_ReturnsFirstPage() {
        // Given
        Pageable pageable = PageRequest.of(0, 1);

        // When
        Page<SessionStreaming> page = sessionStreamingRepository.findAll(pageable);

        // Then
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getNumber()).isEqualTo(0);
        assertThat(page.isFirst()).isTrue();
        assertThat(page.isLast()).isFalse();
    }

    @Test
    @DisplayName("findAll avec pagination - Page 1")
    void findAllWithPageable_SecondPage_ReturnsSecondPage() {
        // Given
        Pageable pageable = PageRequest.of(1, 1);

        // When
        Page<SessionStreaming> page = sessionStreamingRepository.findAll(pageable);

        // Then
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getNumber()).isEqualTo(1);
        assertThat(page.isFirst()).isFalse();
        assertThat(page.isLast()).isTrue();
    }

    @Test
    @DisplayName("count - Compte toutes les sessions")
    void count_ReturnsCorrectCount() {
        // When
        long count = sessionStreamingRepository.count();

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("existsById - Session existante")
    void existsById_SessionExists_ReturnsTrue() {
        // When
        boolean exists = sessionStreamingRepository.existsById(session1.getId());

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsById - Session inexistante")
    void existsById_SessionNotFound_ReturnsFalse() {
        // When
        boolean exists = sessionStreamingRepository.existsById(999L);

        // Then
        assertThat(exists).isFalse();
    }
}
