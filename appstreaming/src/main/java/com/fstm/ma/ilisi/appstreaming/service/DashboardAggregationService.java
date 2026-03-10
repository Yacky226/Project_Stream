package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.StudentDashboardDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.TeacherDashboardDTO;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardAggregationService {

    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;
    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final SessionStreamingRepository sessionStreamingRepository;

    public DashboardAggregationService(EtudiantRepository etudiantRepository,
                                       EnseignantRepository enseignantRepository,
                                       CoursRepository coursRepository,
                                       InscriptionRepository inscriptionRepository,
                                       SessionStreamingRepository sessionStreamingRepository) {
        this.etudiantRepository = etudiantRepository;
        this.enseignantRepository = enseignantRepository;
        this.coursRepository = coursRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.sessionStreamingRepository = sessionStreamingRepository;
    }

    public StudentDashboardDTO buildStudentDashboard(String email) {
        Etudiant etudiant = etudiantRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Etudiant non trouve avec email : " + email));

        List<Inscription> inscriptions = inscriptionRepository.findByEtudiantId(etudiant.getId());
        Set<Long> courseIds = inscriptions.stream()
                .map(Inscription::getCours)
                .filter(Objects::nonNull)
                .map(Cours::getId)
                .collect(Collectors.toSet());

        List<SessionStreaming> sessions = courseIds.isEmpty()
                ? Collections.emptyList()
                : sessionStreamingRepository.findByCoursIdIn(courseIds);

        Map<Long, List<SessionStreaming>> sessionsByCourse = sessions.stream()
                .filter(session -> session.getCours() != null && session.getCours().getId() != null)
                .collect(Collectors.groupingBy(session -> session.getCours().getId()));

        List<StudentDashboardDTO.DashboardSessionItemDTO> upcomingSessions = sessions.stream()
                .filter(this::isUpcomingOrLive)
                .sorted(Comparator.comparing(
                        SessionStreaming::getDateHeure,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .limit(10)
                .map(this::toSessionItem)
                .collect(Collectors.toList());

        List<StudentDashboardDTO.StudentDashboardCourseDTO> courses = inscriptions.stream()
                .map(inscription -> {
                    Cours cours = inscription.getCours();
                    Long coursId = cours != null ? cours.getId() : null;
                    String nextSessionAt = getNextSessionIso(sessionsByCourse.get(coursId));

                    return new StudentDashboardDTO.StudentDashboardCourseDTO(
                            coursId != null ? String.valueOf(coursId) : null,
                            cours != null ? cours.getTitre() : "Cours",
                            cours != null ? cours.getDescription() : "",
                            cours != null ? cours.getCategorie() : "General",
                            safeProgress(inscription.getProgression()),
                            inscription.getStatut() != null ? inscription.getStatut().name() : StatutInscription.ACTIF.name(),
                            toIso(inscription.getDateInscription()),
                            nextSessionAt
                    );
                })
                .collect(Collectors.toList());

        int enrolledCourses = inscriptions.size();
        int activeCourses = (int) inscriptions.stream()
                .filter(i -> i.getStatut() == StatutInscription.ACTIF)
                .count();
        int completedCourses = (int) inscriptions.stream()
                .filter(i -> i.getStatut() == StatutInscription.TERMINE)
                .count();
        double averageProgress = enrolledCourses == 0
                ? 0.0
                : roundOneDecimal(
                        inscriptions.stream().mapToDouble(i -> safeProgress(i.getProgression())).average().orElse(0.0)
                );

        List<StudentDashboardDTO.DashboardActivityItemDTO> recentActivity = buildStudentRecentActivity(inscriptions);

        StudentDashboardDTO.StudentDashboardStatsDTO stats = new StudentDashboardDTO.StudentDashboardStatsDTO(
                enrolledCourses,
                activeCourses,
                completedCourses,
                averageProgress,
                upcomingSessions.size()
        );

        return new StudentDashboardDTO(stats, courses, upcomingSessions, recentActivity);
    }

    public TeacherDashboardDTO buildTeacherDashboard(String email) {
        Enseignant enseignant = enseignantRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant non trouve avec email : " + email));

        List<Cours> courses = coursRepository.findByEnseignantId(enseignant.getId());
        Set<Long> courseIds = courses.stream()
                .map(Cours::getId)
                .collect(Collectors.toSet());

        List<Inscription> inscriptions = courseIds.isEmpty()
                ? Collections.emptyList()
                : inscriptionRepository.findByCoursIdIn(courseIds);
        List<SessionStreaming> sessions = courseIds.isEmpty()
                ? Collections.emptyList()
                : sessionStreamingRepository.findByCoursIdIn(courseIds);

        Map<Long, List<Inscription>> inscriptionsByCourse = inscriptions.stream()
                .filter(inscription -> inscription.getCours() != null && inscription.getCours().getId() != null)
                .collect(Collectors.groupingBy(inscription -> inscription.getCours().getId()));

        Map<Long, List<SessionStreaming>> sessionsByCourse = sessions.stream()
                .filter(session -> session.getCours() != null && session.getCours().getId() != null)
                .collect(Collectors.groupingBy(session -> session.getCours().getId()));

        List<TeacherDashboardDTO.TeacherDashboardCourseDTO> courseRows = courses.stream()
                .map(course -> {
                    List<Inscription> courseInscriptions = inscriptionsByCourse.getOrDefault(course.getId(), Collections.emptyList());
                    List<SessionStreaming> courseSessions = sessionsByCourse.getOrDefault(course.getId(), Collections.emptyList());

                    int enrollments = courseInscriptions.size();
                    int activeEnrollments = (int) courseInscriptions.stream()
                            .filter(inscription -> inscription.getStatut() == StatutInscription.ACTIF)
                            .count();
                    double completionRate = enrollments == 0
                            ? 0.0
                            : roundOneDecimal(
                                    courseInscriptions.stream()
                                            .mapToDouble(i -> safeProgress(i.getProgression()))
                                            .average()
                                            .orElse(0.0)
                            );
                    int liveSessions = (int) courseSessions.stream().filter(this::isLive).count();
                    String nextSessionAt = getNextSessionIso(courseSessions);

                    return new TeacherDashboardDTO.TeacherDashboardCourseDTO(
                            String.valueOf(course.getId()),
                            course.getTitre(),
                            course.getDescription(),
                            course.getCategorie(),
                            enrollments,
                            activeEnrollments,
                            completionRate,
                            courseSessions.size(),
                            liveSessions,
                            nextSessionAt
                    );
                })
                .collect(Collectors.toList());

        List<StudentDashboardDTO.DashboardSessionItemDTO> upcomingSessions = sessions.stream()
                .filter(this::isUpcomingOrLive)
                .sorted(Comparator.comparing(
                        SessionStreaming::getDateHeure,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .limit(10)
                .map(this::toSessionItem)
                .collect(Collectors.toList());

        int totalCourses = courses.size();
        int totalStudents = courseRows.stream().mapToInt(TeacherDashboardDTO.TeacherDashboardCourseDTO::getEnrollments).sum();
        int activeEnrollments = courseRows.stream().mapToInt(TeacherDashboardDTO.TeacherDashboardCourseDTO::getActiveEnrollments).sum();
        int liveSessions = (int) sessions.stream().filter(this::isLive).count();
        double averageCompletionRate = totalCourses == 0
                ? 0.0
                : roundOneDecimal(
                        courseRows.stream().mapToDouble(TeacherDashboardDTO.TeacherDashboardCourseDTO::getCompletionRate).average().orElse(0.0)
                );

        TeacherDashboardDTO.TeacherDashboardStatsDTO stats = new TeacherDashboardDTO.TeacherDashboardStatsDTO(
                totalCourses,
                totalStudents,
                activeEnrollments,
                averageCompletionRate,
                upcomingSessions.size(),
                liveSessions
        );

        return new TeacherDashboardDTO(stats, courseRows, upcomingSessions);
    }

    private List<StudentDashboardDTO.DashboardActivityItemDTO> buildStudentRecentActivity(List<Inscription> inscriptions) {
        List<StudentDashboardDTO.DashboardActivityItemDTO> items = new ArrayList<>();

        for (Inscription inscription : inscriptions) {
            Cours cours = inscription.getCours();
            String titreCours = cours != null ? cours.getTitre() : "Cours";

            items.add(new StudentDashboardDTO.DashboardActivityItemDTO(
                    "enrolled-" + inscription.getId(),
                    "enrolled",
                    "Inscription: " + titreCours,
                    toIso(inscription.getDateInscription()),
                    null
            ));

            double progress = safeProgress(inscription.getProgression());
            if (inscription.getStatut() == StatutInscription.TERMINE || progress >= 100.0) {
                items.add(new StudentDashboardDTO.DashboardActivityItemDTO(
                        "completed-" + inscription.getId(),
                        "completed",
                        "Cours termine: " + titreCours,
                        toIso(inscription.getDateCompletion() != null ? inscription.getDateCompletion() : inscription.getDateInscription()),
                        null
                ));
            } else if (progress > 0.0) {
                items.add(new StudentDashboardDTO.DashboardActivityItemDTO(
                        "progress-" + inscription.getId(),
                        "progress",
                        "Progression " + roundOneDecimal(progress) + "%: " + titreCours,
                        toIso(inscription.getDateCompletion() != null ? inscription.getDateCompletion() : inscription.getDateInscription()),
                        null
                ));
            }
        }

        return items.stream()
                .sorted(Comparator.comparing(
                        StudentDashboardDTO.DashboardActivityItemDTO::getOccurredAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .limit(10)
                .collect(Collectors.toList());
    }

    private StudentDashboardDTO.DashboardSessionItemDTO toSessionItem(SessionStreaming session) {
        Cours cours = session.getCours();
        Long courseId = cours != null ? cours.getId() : null;

        return new StudentDashboardDTO.DashboardSessionItemDTO(
                String.valueOf(session.getId()),
                courseId != null ? String.valueOf(courseId) : null,
                cours != null ? cours.getTitre() : "Cours",
                toIso(session.getDateHeure()),
                isLive(session),
                session.getStatus() != null ? session.getStatus().name() : (session.isEstEnDirect() ? StreamStatus.LIVE.name() : StreamStatus.CREATED.name())
        );
    }

    private boolean isLive(SessionStreaming session) {
        return session.isEstEnDirect() || session.getStatus() == StreamStatus.LIVE;
    }

    private boolean isUpcomingOrLive(SessionStreaming session) {
        if (isLive(session)) {
            return true;
        }

        LocalDateTime start = session.getDateHeure();
        return start != null && !start.isBefore(LocalDateTime.now());
    }

    private String getNextSessionIso(List<SessionStreaming> sessions) {
        if (sessions == null || sessions.isEmpty()) {
            return null;
        }

        return sessions.stream()
                .filter(this::isUpcomingOrLive)
                .sorted(Comparator.comparing(
                        SessionStreaming::getDateHeure,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ))
                .map(SessionStreaming::getDateHeure)
                .filter(Objects::nonNull)
                .map(this::toIso)
                .findFirst()
                .orElse(null);
    }

    private String toIso(LocalDateTime value) {
        return value != null ? value.toString() : null;
    }

    private double safeProgress(Double value) {
        if (value == null) {
            return 0.0;
        }
        if (value < 0.0) {
            return 0.0;
        }
        if (value > 100.0) {
            return 100.0;
        }
        return value;
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
