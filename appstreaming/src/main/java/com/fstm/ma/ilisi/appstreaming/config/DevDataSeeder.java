package com.fstm.ma.ilisi.appstreaming.config;

import com.fstm.ma.ilisi.appstreaming.model.bo.Administrateur;
import com.fstm.ma.ilisi.appstreaming.model.bo.Avis;
import com.fstm.ma.ilisi.appstreaming.model.bo.ChatMessage;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.Lecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.Ressource;
import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.model.bo.Section;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.bo.TypeLecon;
import com.fstm.ma.ilisi.appstreaming.model.bo.TypeRessource;
import com.fstm.ma.ilisi.appstreaming.repository.AdministrateurRepository;
import com.fstm.ma.ilisi.appstreaming.repository.AvisRepository;
import com.fstm.ma.ilisi.appstreaming.repository.ChatMessageRepository;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.dev.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DevDataSeeder implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "Seed2026!";
    private static final Random RNG = new Random(20260315L);

    private final PasswordEncoder passwordEncoder;
    private final AdministrateurRepository administrateurRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final AvisRepository avisRepository;
    private final SessionStreamingRepository sessionStreamingRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<Administrateur> admins = seedAdmins();
        List<Enseignant> enseignants = seedTeachers();
        List<Etudiant> etudiants = seedStudents();
        List<Cours> cours = seedCourses(enseignants);
        seedInscriptionsAndReviews(cours, etudiants);
        List<SessionStreaming> sessions = seedSessions(cours);
        seedChatMessages(sessions, etudiants);

        log.info(
                "Dev seeding done | admins={} teachers={} students={} courses={} inscriptions={} reviews={} sessions={} messages={}",
                admins.size(),
                enseignants.size(),
                etudiants.size(),
                coursRepository.count(),
                inscriptionRepository.count(),
                avisRepository.count(),
                sessionStreamingRepository.count(),
                chatMessageRepository.count());
        log.info("Seed default password for all generated users: {}", DEFAULT_PASSWORD);
    }

    private List<Administrateur> seedAdmins() {
        String[][] admins = {
            {"admin", "Platform", "Owner"},
            {"ops", "Operations", "Lead"}
        };

        List<Administrateur> result = new ArrayList<>();
        for (String[] admin : admins) {
            String localPart = admin[0];
            String email = localPart + "@seed.edu";
            Administrateur existing = administrateurRepository.findByEmail(email).orElse(null);
            if (existing != null) {
                result.add(existing);
                continue;
            }

            Administrateur created = new Administrateur();
            created.setNom(admin[1]);
            created.setPrenom(admin[2]);
            created.setEmail(email);
            created.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            created.setRole(Role.ADMINISTRATEUR);
            created.setActif(true);
            created.setDateNaissance(LocalDate.of(1985, 1, 1));
            created.setPhotoProfil("https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop");
            result.add(administrateurRepository.save(created));
        }
        return result;
    }

    private List<Enseignant> seedTeachers() {
        String[][] teachers = {
            {"Amina", "Bennani", "Software Architecture"},
            {"Youssef", "El Idrissi", "Frontend Engineering"},
            {"Leila", "Tazi", "Data Science"},
            {"Karim", "Mouline", "Cybersecurity"},
            {"Nadia", "Hammadi", "Cloud & DevOps"},
            {"Rachid", "Alaoui", "Product Management"},
            {"Salma", "Jabri", "UX Research"},
            {"Hassan", "Berrada", "Mobile Development"},
            {"Imane", "Zerouali", "AI Engineering"},
            {"Mehdi", "Kabbaj", "Business Analytics"}
        };

        List<Enseignant> result = new ArrayList<>();
        for (int index = 0; index < teachers.length; index++) {
            String email = "teacher" + String.format("%02d", index + 1) + "@seed.edu";
            Enseignant existing = enseignantRepository.findByEmail(email).orElse(null);
            if (existing != null) {
                result.add(existing);
                continue;
            }

            Enseignant enseignant = new Enseignant();
            enseignant.setPrenom(teachers[index][0]);
            enseignant.setNom(teachers[index][1]);
            enseignant.setSpecialite(teachers[index][2]);
            enseignant.setEmail(email);
            enseignant.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            enseignant.setRole(Role.ENSEIGNANT);
            enseignant.setActif(true);
            enseignant.setDateNaissance(LocalDate.of(1980 + (index % 10), 2 + (index % 10), 5 + (index % 20)));
            enseignant.setPhotoProfil("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&h=300&fit=crop");
            result.add(enseignantRepository.save(enseignant));
        }
        return result;
    }

    private List<Etudiant> seedStudents() {
        String[] firstNames = {
            "Adam", "Sara", "Yasmine", "Omar", "Ines", "Nour", "Zakaria", "Meryem", "Ayoub", "Lina",
            "Bilal", "Dina", "Samir", "Hajar", "Taha", "Kenza", "Sami", "Rania", "Anas", "Ilham"
        };
        String[] lastNames = {
            "Ait Lahcen", "Boukhriss", "El Fakir", "Amrani", "Chraibi", "Naji", "Ouahbi", "Hassani", "Slaoui", "Bennis"
        };
        String[] levels = {"L1", "L2", "L3", "M1", "M2"};

        List<Etudiant> result = new ArrayList<>();
        for (int index = 0; index < 120; index++) {
            String email = "student" + String.format("%03d", index + 1) + "@seed.edu";
            Etudiant existing = etudiantRepository.findByEmail(email).orElse(null);
            if (existing != null) {
                result.add(existing);
                continue;
            }

            Etudiant etudiant = new Etudiant();
            etudiant.setPrenom(firstNames[index % firstNames.length]);
            etudiant.setNom(lastNames[index % lastNames.length]);
            etudiant.setNiveau(levels[index % levels.length]);
            etudiant.setEmail(email);
            etudiant.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            etudiant.setRole(Role.ETUDIANT);
            etudiant.setActif(true);
            etudiant.setDateNaissance(LocalDate.of(1998 + (index % 8), 1 + (index % 12), 1 + (index % 27)));
            etudiant.setPhotoProfil("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop");
            result.add(etudiantRepository.save(etudiant));
        }
        return result;
    }

    private List<Cours> seedCourses(List<Enseignant> enseignants) {
        Map<String, Cours> existingByTitle =
                coursRepository.findAll().stream()
                        .collect(Collectors.toMap(
                                course -> normalize(course.getTitre()),
                                Function.identity(),
                                (left, right) -> left,
                                LinkedHashMap::new));

        List<CourseBlueprint> blueprints = courseBlueprints();
        List<Cours> result = new ArrayList<>();

        for (int index = 0; index < blueprints.size(); index++) {
            CourseBlueprint blueprint = blueprints.get(index);
            String key = normalize(blueprint.title);
            Cours course = existingByTitle.get(key);
            Enseignant teacher = enseignants.get(index % enseignants.size());

            if (course == null) {
                course = new Cours();
                course.setTitre(blueprint.title);
                course.setDescription(blueprint.description);
                course.setCategorie(blueprint.category);
                course.setHoraire(LocalDateTime.now().plusDays((index % 28) + 1).withHour(18).withMinute(30));
                course.setEnseignant(teacher);
                course.setArchive(index % 17 == 0);
                course.setImageUrl(blueprint.imageUrl);
                course.setDureeEstimeeHeures(blueprint.durationHours);
                createCourseStructure(course, index);
                course = coursRepository.save(course);
            } else {
                if (course.getEnseignant() == null) {
                    course.setEnseignant(teacher);
                }
                if (course.getImageUrl() == null || course.getImageUrl().isBlank()) {
                    course.setImageUrl(blueprint.imageUrl);
                }
                if (course.getDureeEstimeeHeures() == null) {
                    course.setDureeEstimeeHeures(blueprint.durationHours);
                }
                if (course.getSections() == null || course.getSections().isEmpty()) {
                    createCourseStructure(course, index);
                }
                course = coursRepository.save(course);
            }

            result.add(course);
            existingByTitle.put(key, course);
        }
        return result;
    }

    private void createCourseStructure(Cours course, int seedIndex) {
        String[] moduleTitles = {"Foundations", "Applied Practice", "Capstone Build"};
        String[] quizPrompts = {
            "Scenario-driven quiz and decision making exercises.",
            "Knowledge check and practical troubleshooting quiz.",
            "Final assessment with implementation-focused questions."
        };

        if (course.getSections() == null) {
            course.setSections(new ArrayList<>());
        }
        if (course.getRessources() == null) {
            course.setRessources(new ArrayList<>());
        }

        for (int sectionIndex = 0; sectionIndex < moduleTitles.length; sectionIndex++) {
            Section section = new Section();
            section.setCours(course);
            section.setOrdre(sectionIndex + 1);
            section.setTitre("Module " + (sectionIndex + 1) + " - " + moduleTitles[sectionIndex]);
            section.setDescription("Hands-on path for " + course.getTitre() + " covering production-ready workflows.");
            section.setLecons(new ArrayList<>());
            course.getSections().add(section);

            for (int lessonIndex = 0; lessonIndex < 4; lessonIndex++) {
                Lecon lesson = new Lecon();
                lesson.setSection(section);
                lesson.setOrdre(lessonIndex + 1);
                lesson.setTitre(moduleTitles[sectionIndex] + " lesson " + (lessonIndex + 1));
                lesson.setDescription("Step-by-step practice and implementation guidance.");
                lesson.setRessources(new ArrayList<>());

                if (lessonIndex == 0 || lessonIndex == 2) {
                    lesson.setType(TypeLecon.VIDEO);
                    lesson.setContenuUrl("https://cdn.seed.edu/video/" + slug(course.getTitre()) + "/" + (sectionIndex + 1) + "-" + (lessonIndex + 1));
                    lesson.setDureeMinutes(25 + RNG.nextInt(15));
                } else if (lessonIndex == 1) {
                    lesson.setType(TypeLecon.TEXTE);
                    lesson.setContenuTexte("Detailed study notes, architecture patterns and actionable implementation steps.");
                    lesson.setDureeMinutes(18 + RNG.nextInt(10));
                } else {
                    lesson.setType(TypeLecon.QUIZ);
                    lesson.setContenuTexte(quizPrompts[sectionIndex]);
                    lesson.setDureeMinutes(12 + RNG.nextInt(8));
                }

                section.getLecons().add(lesson);

                Ressource lessonResource = new Ressource();
                lessonResource.setCours(course);
                lessonResource.setLecon(lesson);
                lessonResource.setTitre("Resource pack " + (sectionIndex + 1) + "." + (lessonIndex + 1));
                lessonResource.setType(lessonIndex % 2 == 0 ? TypeRessource.PDF : TypeRessource.LIEN);
                lessonResource.setUrl("https://cdn.seed.edu/resources/" + slug(course.getTitre()) + "/" + (sectionIndex + 1) + "-" + (lessonIndex + 1));
                lessonResource.setTailleFichier(120_000L + (long) RNG.nextInt(2_000_000));

                lesson.getRessources().add(lessonResource);
                course.getRessources().add(lessonResource);
            }
        }

        Ressource courseGuide = new Ressource();
        courseGuide.setCours(course);
        courseGuide.setTitre("Course roadmap");
        courseGuide.setType(TypeRessource.PDF);
        courseGuide.setUrl("https://cdn.seed.edu/resources/" + slug(course.getTitre()) + "/roadmap");
        courseGuide.setTailleFichier(800_000L + seedIndex * 10_000L);
        course.getRessources().add(courseGuide);
    }

    private void seedInscriptionsAndReviews(List<Cours> cours, List<Etudiant> etudiants) {
        String[] reviewComments = {
            "Excellent practical depth and clear explanations.",
            "Very useful content with real-world projects.",
            "Strong module sequencing and actionable material.",
            "Great mentor support and structured lessons.",
            "High quality course, I would recommend it."
        };

        for (int courseIndex = 0; courseIndex < cours.size(); courseIndex++) {
            Cours course = cours.get(courseIndex);

            List<Etudiant> shuffled = new ArrayList<>(etudiants);
            Collections.shuffle(shuffled, RNG);
            int targetEnrollments = Math.min(shuffled.size(), 24 + (courseIndex % 18));

            List<Etudiant> enrolled = new ArrayList<>();
            for (int idx = 0; idx < targetEnrollments; idx++) {
                Etudiant student = shuffled.get(idx);
                enrolled.add(student);
                if (inscriptionRepository.existsByEtudiantIdAndCoursId(student.getId(), course.getId())) {
                    continue;
                }

                Inscription inscription = new Inscription();
                inscription.setEtudiant(student);
                inscription.setCours(course);
                inscription.setDateInscription(LocalDateTime.now().minusDays(RNG.nextInt(180)));

                double progression = 15 + RNG.nextInt(86);
                StatutInscription status;
                if (progression >= 88) {
                    status = StatutInscription.TERMINE;
                } else if (RNG.nextDouble() < 0.12) {
                    status = StatutInscription.ABANDONNE;
                } else {
                    status = StatutInscription.ACTIF;
                }
                inscription.setProgression(progression);
                inscription.setStatut(status);
                if (status == StatutInscription.TERMINE) {
                    inscription.setDateCompletion(LocalDateTime.now().minusDays(RNG.nextInt(30)));
                }

                inscriptionRepository.save(inscription);
            }

            int targetReviews = Math.min(enrolled.size(), 10 + (courseIndex % 6));
            for (int idx = 0; idx < targetReviews; idx++) {
                Etudiant student = enrolled.get(idx);
                if (avisRepository.existsByEtudiantIdAndCoursId(student.getId(), course.getId())) {
                    continue;
                }

                Avis review = new Avis();
                review.setEtudiant(student);
                review.setCours(course);
                review.setNote(3 + RNG.nextInt(3));
                review.setCommentaire(reviewComments[(idx + courseIndex) % reviewComments.length]);
                review.setDateCreation(LocalDateTime.now().minusDays(RNG.nextInt(90)));
                avisRepository.save(review);
            }
        }
    }

    private List<SessionStreaming> seedSessions(List<Cours> cours) {
        List<SessionStreaming> result = new ArrayList<>();
        for (int index = 0; index < cours.size(); index++) {
            Cours course = cours.get(index);
            List<SessionStreaming> existing = sessionStreamingRepository.findByCoursId(course.getId());
            if (!existing.isEmpty()) {
                result.addAll(existing);
                continue;
            }

            SessionStreaming session = new SessionStreaming();
            session.setCours(course);
            session.setEnseignant(course.getEnseignant());
            session.setRecordingEnabled(true);
            session.setBroadcastType(index % 2 == 0 ? "WebRTC" : "RTMP");
            session.setResolution(index % 3 == 0 ? "1080p" : "720p");
            session.setStreamKey("seed-stream-" + course.getId());

            if (index % 7 == 0) {
                session.setStatus(StreamStatus.LIVE);
                session.setEstEnDirect(true);
                session.setDateHeure(LocalDateTime.now().minusMinutes(35));
                session.setVideoUrl("http://localhost:5080/LiveApp/streams/seed-live-" + course.getId() + ".m3u8");
            } else if (index % 3 == 0) {
                session.setStatus(StreamStatus.CREATED);
                session.setEstEnDirect(false);
                session.setDateHeure(LocalDateTime.now().plusDays(index % 14).withHour(19).withMinute(0));
                session.setVideoUrl(null);
            } else {
                session.setStatus(StreamStatus.ENDED);
                session.setEstEnDirect(false);
                session.setDateHeure(LocalDateTime.now().minusDays((index % 20) + 1).withHour(18).withMinute(0));
                session.setRecordingUrl("http://localhost:5080/LiveApp/streams/seed-replay-" + course.getId() + ".mp4");
                session.setVideoUrl("http://localhost:5080/LiveApp/streams/seed-replay-" + course.getId() + ".m3u8");
            }

            result.add(sessionStreamingRepository.save(session));
        }
        return result;
    }

    private void seedChatMessages(List<SessionStreaming> sessions, List<Etudiant> etudiants) {
        String[] teacherMessages = {
            "Welcome everyone. Today we focus on practical implementation and decision flow.",
            "Great question. Let's break this into smaller architecture patterns.",
            "Keep sharing examples from your projects, that improves retention a lot.",
            "I will upload updated resources at the end of the session."
        };
        String[] studentMessages = {
            "Could you explain how this scales in production?",
            "This workflow helped me fix my current project issue.",
            "Can we get the template used in this demonstration?",
            "The previous module clarified many concepts for me."
        };

        for (SessionStreaming session : sessions) {
            if (chatMessageRepository.countBySessionId(session.getId()) > 0) {
                continue;
            }
            if (session.getStatus() == StreamStatus.CREATED) {
                continue;
            }

            List<Inscription> enrollments = inscriptionRepository.findByCoursId(session.getCours().getId());
            List<Etudiant> participants = enrollments.stream()
                    .map(Inscription::getEtudiant)
                    .limit(4)
                    .collect(Collectors.toCollection(ArrayList::new));
            if (participants.isEmpty()) {
                participants.addAll(etudiants.subList(0, Math.min(3, etudiants.size())));
            }

            List<ChatMessage> messages = new ArrayList<>();
            LocalDateTime base = (session.getDateHeure() != null ? session.getDateHeure() : LocalDateTime.now()).minusMinutes(18);
            for (int index = 0; index < 6; index++) {
                ChatMessage message = new ChatMessage();
                boolean fromTeacher = index % 2 == 1;
                message.setSession(session);
                message.setExpediteur(fromTeacher
                        ? session.getEnseignant()
                        : participants.get(index % participants.size()));
                message.setContenu(fromTeacher
                        ? teacherMessages[index % teacherMessages.length]
                        : studentMessages[index % studentMessages.length]);
                message.setTimestamp(base.plusMinutes(index * 3L));
                messages.add(message);
            }
            chatMessageRepository.saveAll(messages);
        }
    }

    private List<CourseBlueprint> courseBlueprints() {
        List<CourseBlueprint> blueprints = new ArrayList<>();
        blueprints.add(new CourseBlueprint(
                "Advanced UI Design Systems",
                "Design",
                "Build scalable and accessible interfaces using reusable component architecture and design tokens.",
                "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1400&h=900&fit=crop",
                18));
        blueprints.add(new CourseBlueprint(
                "Mastering React 18 and Hooks",
                "Development",
                "Deep dive into hooks, rendering performance, and state orchestration in modern frontend stacks.",
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1400&h=900&fit=crop",
                22));
        blueprints.add(new CourseBlueprint(
                "PostgreSQL for Product Teams",
                "Data",
                "Design robust schemas, optimize queries, and ship reliable analytics pipelines.",
                "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1400&h=900&fit=crop",
                16));
        blueprints.add(new CourseBlueprint(
                "Cloud Native DevOps Bootcamp",
                "DevOps",
                "Automate CI/CD, infrastructure as code, and resilient cloud deployment patterns.",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=900&fit=crop",
                24));
        blueprints.add(new CourseBlueprint(
                "Cybersecurity Foundations",
                "Security",
                "Threat modeling, secure coding, and defensive monitoring for production-grade systems.",
                "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&h=900&fit=crop",
                20));
        blueprints.add(new CourseBlueprint(
                "AI Product Engineering",
                "AI",
                "From model selection to deployment: build practical AI features with measurable business value.",
                "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1400&h=900&fit=crop",
                26));
        blueprints.add(new CourseBlueprint(
                "System Design for Scale",
                "Architecture",
                "Plan highly-available systems with strong consistency tradeoffs and observability standards.",
                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&h=900&fit=crop",
                28));
        blueprints.add(new CourseBlueprint(
                "Data Visualization with Python",
                "Data",
                "Turn complex metrics into clear narratives with modern plotting and dashboard techniques.",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=900&fit=crop",
                14));
        blueprints.add(new CourseBlueprint(
                "Product Analytics in Practice",
                "Business",
                "Use behavioral funnels, cohorts, and experimentation frameworks to drive product outcomes.",
                "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&h=900&fit=crop",
                15));
        blueprints.add(new CourseBlueprint(
                "Advanced UX Research",
                "Design",
                "Plan and execute qualitative and quantitative research to guide product strategy.",
                "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&h=900&fit=crop",
                17));
        blueprints.add(new CourseBlueprint(
                "Mobile Development with React Native",
                "Mobile",
                "Ship cross-platform mobile apps with production-ready architecture and performance controls.",
                "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1400&h=900&fit=crop",
                19));
        blueprints.add(new CourseBlueprint(
                "Kubernetes from Zero to Production",
                "DevOps",
                "Container orchestration, workload scaling, and zero-downtime delivery in Kubernetes clusters.",
                "https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?w=1400&h=900&fit=crop",
                23));
        blueprints.add(new CourseBlueprint(
                "Secure API Development",
                "Security",
                "Build and harden REST APIs with authentication, authorization, and threat prevention patterns.",
                "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1400&h=900&fit=crop",
                13));
        blueprints.add(new CourseBlueprint(
                "Next.js Fullstack Applications",
                "Development",
                "Compose modern fullstack products with SSR, APIs, caching strategies, and deployment pipelines.",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=900&fit=crop",
                21));
        blueprints.add(new CourseBlueprint(
                "Business Storytelling with Data",
                "Business",
                "Create high-impact dashboards and executive narratives that influence strategic decisions.",
                "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1400&h=900&fit=crop",
                12));
        blueprints.add(new CourseBlueprint(
                "Practical Machine Learning Ops",
                "AI",
                "Model lifecycle, drift monitoring, and reliable ML deployment in production systems.",
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&h=900&fit=crop",
                22));
        blueprints.add(new CourseBlueprint(
                "Service Mesh and Microservices",
                "Architecture",
                "Design resilient distributed systems with observability, reliability, and traffic control.",
                "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&h=900&fit=crop",
                20));
        blueprints.add(new CourseBlueprint(
                "Frontend Performance Engineering",
                "Development",
                "Measure, optimize, and maintain top-tier web performance for large scale products.",
                "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&h=900&fit=crop",
                16));
        blueprints.add(new CourseBlueprint(
                "Design Tokens and Theming",
                "Design",
                "Implement reusable styling primitives and robust cross-platform theming systems.",
                "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1400&h=900&fit=crop",
                11));
        blueprints.add(new CourseBlueprint(
                "Cloud Cost Optimization",
                "DevOps",
                "Reduce infrastructure waste and monitor efficiency without sacrificing reliability.",
                "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1400&h=900&fit=crop",
                10));
        blueprints.add(new CourseBlueprint(
                "Applied Cryptography for Engineers",
                "Security",
                "Practical encryption, key management, and secure exchange for modern applications.",
                "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1400&h=900&fit=crop",
                18));
        blueprints.add(new CourseBlueprint(
                "Data Engineering Pipelines",
                "Data",
                "Build resilient ingestion, transformation, and orchestration layers for analytics teams.",
                "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&h=900&fit=crop",
                24));
        blueprints.add(new CourseBlueprint(
                "Strategic Product Leadership",
                "Business",
                "Lead roadmap decisions, stakeholder alignment, and high-performance product teams.",
                "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&h=900&fit=crop",
                14));
        blueprints.add(new CourseBlueprint(
                "Mobile Performance and Monitoring",
                "Mobile",
                "Optimize startup time, memory usage, and runtime performance on iOS and Android.",
                "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=1400&h=900&fit=crop",
                15));
        return blueprints;
    }

    private String normalize(String value) {
        return (value == null ? "" : value).trim().toLowerCase(Locale.ROOT);
    }

    private String slug(String value) {
        return normalize(value).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private static final class CourseBlueprint {
        private final String title;
        private final String category;
        private final String description;
        private final String imageUrl;
        private final Integer durationHours;

        private CourseBlueprint(String title, String category, String description, String imageUrl, Integer durationHours) {
            this.title = title;
            this.category = category;
            this.description = description;
            this.imageUrl = imageUrl;
            this.durationHours = durationHours;
        }
    }
}
