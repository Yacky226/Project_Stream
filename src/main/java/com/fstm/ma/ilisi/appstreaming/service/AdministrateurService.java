package com.fstm.ma.ilisi.appstreaming.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.mapper.UtilisateurMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Administrateur;
import com.fstm.ma.ilisi.appstreaming.model.bo.Cours;
import com.fstm.ma.ilisi.appstreaming.model.bo.Enseignant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.Inscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.StatutInscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CourseManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.DashboardStatsDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserManagementDTO;
import com.fstm.ma.ilisi.appstreaming.repository.AdministrateurRepository;
import com.fstm.ma.ilisi.appstreaming.repository.AvisRepository;
import com.fstm.ma.ilisi.appstreaming.repository.ChatMessageRepository;
import com.fstm.ma.ilisi.appstreaming.repository.CoursRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EnseignantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.HandRaiseRepository;
import com.fstm.ma.ilisi.appstreaming.repository.InscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.LeconRepository;
import com.fstm.ma.ilisi.appstreaming.repository.QuestionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SectionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;

@Service
@Transactional
public class AdministrateurService implements AdministrateurServiceInterface {

 private final AdministrateurRepository administrateurRepository;
 private final UtilisateurRepository utilisateurRepository;
 private final EtudiantRepository etudiantRepository;
 private final EnseignantRepository enseignantRepository;
 private final CoursRepository coursRepository;
 private final InscriptionRepository inscriptionRepository;
 private final SectionRepository sectionRepository;
 private final LeconRepository leconRepository;
 private final SessionStreamingRepository sessionRepository;
 private final AvisRepository avisRepository;
 private final ChatMessageRepository chatRepository;
 private final QuestionRepository questionRepository;
 private final HandRaiseRepository handRaiseRepository;
 private final UtilisateurMapper utilisateurMapper;
 private final PasswordEncoder passwordEncoder;

 public AdministrateurService(
		 AdministrateurRepository administrateurRepository,
		 UtilisateurRepository utilisateurRepository,
		 EtudiantRepository etudiantRepository,
		 EnseignantRepository enseignantRepository,
		 CoursRepository coursRepository,
		 InscriptionRepository inscriptionRepository,
		 SectionRepository sectionRepository,
		 LeconRepository leconRepository,
		 SessionStreamingRepository sessionRepository,
		 AvisRepository avisRepository,
		 ChatMessageRepository chatRepository,
		 QuestionRepository questionRepository,
		 HandRaiseRepository handRaiseRepository,
		 UtilisateurMapper utilisateurMapper,
		 PasswordEncoder passwordEncoder) {
     this.administrateurRepository = administrateurRepository;
     this.utilisateurRepository = utilisateurRepository;
     this.etudiantRepository = etudiantRepository;
     this.enseignantRepository = enseignantRepository;
     this.coursRepository = coursRepository;
     this.inscriptionRepository = inscriptionRepository;
     this.sectionRepository = sectionRepository;
     this.leconRepository = leconRepository;
     this.sessionRepository = sessionRepository;
     this.avisRepository = avisRepository;
     this.chatRepository = chatRepository;
     this.questionRepository = questionRepository;
     this.handRaiseRepository = handRaiseRepository;
     this.utilisateurMapper = utilisateurMapper;
     this.passwordEncoder = passwordEncoder;
 }

 @Override
 public AdministrateurDTO ajouterAdministrateur(AdministrateurDTO dto) {
     Administrateur admin = new Administrateur();
     utilisateurMapper.updateEntityFromDTO(dto, admin);
     admin.setPassword(passwordEncoder.encode(dto.getPassword()));
     return (AdministrateurDTO) utilisateurMapper.toDTO(administrateurRepository.save(admin));
 }

 @Override
 public List<AdministrateurDTO> getTousLesAdministrateurs() {
     return administrateurRepository.findAll()
             .stream()
             .map(admin -> (AdministrateurDTO) utilisateurMapper.toDTO(admin))
             .collect(Collectors.toList());
 }

 @Override
 public AdministrateurDTO getAdministrateurParId(Long id) {
     return administrateurRepository.findById(id)
             .map(admin -> (AdministrateurDTO) utilisateurMapper.toDTO(admin))
             .orElseThrow(() -> new RuntimeException("Administrateur non trouvé"));
 }

 @Override
 public void supprimerAdministrateur(Long id) {
     administrateurRepository.deleteById(id);
 }
 
 // ================== DASHBOARD ET STATISTIQUES ==================
 
 @Override
 public DashboardStatsDTO getDashboardStats() {
     DashboardStatsDTO stats = new DashboardStatsDTO();
     
     // Statistiques utilisateurs
     stats.setTotalUtilisateurs(utilisateurRepository.count());
     stats.setTotalEtudiants(etudiantRepository.count());
     stats.setTotalEnseignants(enseignantRepository.count());
     stats.setTotalAdministrateurs(administrateurRepository.count());
     
     // Statistiques cours
     stats.setTotalCours(coursRepository.count());
     stats.setCoursActifs(coursRepository.countByArchiveFalse());
     stats.setCoursArchives(coursRepository.countByArchiveTrue());
     
     // Statistiques inscriptions
     stats.setTotalInscriptions(inscriptionRepository.count());
     stats.setInscriptionsActives(inscriptionRepository.countByStatut(StatutInscription.ACTIF));
     
     // Structure des cours
     stats.setTotalSections(sectionRepository.count());
     stats.setTotalLecons(leconRepository.count());
     
     // Sessions de streaming
     stats.setTotalSessions(sessionRepository.count());
     stats.setSessionsLive((long) sessionRepository.findActiveSessions().size());
     stats.setSessionsTerminees((long) sessionRepository.findSessionsWithRecording().size());
     
     // Interactivité
     stats.setTotalMessages(chatRepository.count());
     stats.setTotalQuestions(questionRepository.count());
     stats.setTotalHandRaises(handRaiseRepository.count());
     
     // Statistiques par période (dernier mois)
     LocalDateTime unMoisAvant = LocalDateTime.now().minusMonths(1);
     stats.setNouvellesInscriptionsMois(inscriptionRepository.countByDateInscriptionAfter(unMoisAvant));
     stats.setNouveauxUtilisateursMois(utilisateurRepository.countByDateCreationAfter(unMoisAvant));
     stats.setSessionsLiveMois(sessionRepository.countByDateHeureAfter(unMoisAvant));
     
     // Moyennes
     Double moyenneNotes = avisRepository.findAverageNote();
     stats.setMoyenneNoteCours(moyenneNotes != null ? moyenneNotes : 0.0);
     
     Double tauxMoyen = inscriptionRepository.findAverageProgression();
     stats.setTauxCompletionMoyen(tauxMoyen != null ? tauxMoyen : 0.0);
     
     // Top éléments
     Map<String, Object> topCours = new HashMap<>();
     List<Object[]> topCoursData = inscriptionRepository.findTop5CoursesByInscriptions();
     topCours.put("data", topCoursData);
     stats.setCoursLesPlusPopulaires(topCours);
     
     Map<String, Object> topEnseignants = new HashMap<>();
     List<Object[]> topEnseignantsData = coursRepository.findTop5EnseignantsByCourses();
     topEnseignants.put("data", topEnseignantsData);
     stats.setEnseignantsLesPlusActifs(topEnseignants);
     
     return stats;
 }
 
 // ================== GESTION DES UTILISATEURS ==================
 
 @Override
 public List<UserManagementDTO> getAllUsers() {
     List<UserManagementDTO> users = new ArrayList<>();
     
     // Étudiants
     etudiantRepository.findAll().forEach(etudiant -> {
         UserManagementDTO dto = new UserManagementDTO();
         dto.setId(etudiant.getId());
         dto.setNom(etudiant.getNom());
         dto.setPrenom(etudiant.getPrenom());
         dto.setEmail(etudiant.getEmail());
         dto.setRole("ETUDIANT");
         dto.setActif(etudiant.isActif());
         dto.setDateCreation(etudiant.getDateCreation());
         dto.setNiveau(etudiant.getNiveau());
         dto.setPhotoProfil(etudiant.getPhotoProfil());
         dto.setNombreInscriptions(etudiant.getInscriptions() != null ? etudiant.getInscriptions().size() : 0);
         dto.setNombreCours(etudiant.getInscriptions() != null ? etudiant.getInscriptions().size() : 0);
         users.add(dto);
     });
     
     // Enseignants
     enseignantRepository.findAll().forEach(enseignant -> {
         UserManagementDTO dto = new UserManagementDTO();
         dto.setId(enseignant.getId());
         dto.setNom(enseignant.getNom());
         dto.setPrenom(enseignant.getPrenom());
         dto.setEmail(enseignant.getEmail());
         dto.setRole("ENSEIGNANT");
         dto.setActif(enseignant.isActif());
         dto.setDateCreation(enseignant.getDateCreation());
         dto.setSpecialite(enseignant.getSpecialite());
         dto.setPhotoProfil(enseignant.getPhotoProfil());
         dto.setNombreCours(enseignant.getCours() != null ? enseignant.getCours().size() : 0);
         dto.setNombreSessions((int) sessionRepository.findByEnseignantId(enseignant.getId()).size());
         users.add(dto);
     });
     
     // Administrateurs
     administrateurRepository.findAll().forEach(admin -> {
         UserManagementDTO dto = new UserManagementDTO();
         dto.setId(admin.getId());
         dto.setNom(admin.getNom());
         dto.setPrenom(admin.getPrenom());
         dto.setEmail(admin.getEmail());
         dto.setRole("ADMINISTRATEUR");
         dto.setActif(admin.isActif());
         dto.setDateCreation(admin.getDateCreation());
         dto.setPhotoProfil(admin.getPhotoProfil());
         users.add(dto);
     });
     
     return users;
 }
 
 @Override
 public UserManagementDTO getUserById(Long id) {
     Utilisateur user = utilisateurRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
     
     UserManagementDTO dto = new UserManagementDTO();
     dto.setId(user.getId());
     dto.setNom(user.getNom());
     dto.setPrenom(user.getPrenom());
     dto.setEmail(user.getEmail());
     dto.setActif(user.isActif());
     dto.setDateCreation(user.getDateCreation());
     dto.setPhotoProfil(user.getPhotoProfil());
     
     if (user instanceof Etudiant) {
         Etudiant etudiant = (Etudiant) user;
         dto.setRole("ETUDIANT");
         dto.setNiveau(etudiant.getNiveau());
         dto.setNombreInscriptions(etudiant.getInscriptions() != null ? etudiant.getInscriptions().size() : 0);
     } else if (user instanceof Enseignant) {
         Enseignant enseignant = (Enseignant) user;
         dto.setRole("ENSEIGNANT");
         dto.setSpecialite(enseignant.getSpecialite());
         dto.setNombreCours(enseignant.getCours() != null ? enseignant.getCours().size() : 0);
     } else if (user instanceof Administrateur) {
         dto.setRole("ADMINISTRATEUR");
     }
     
     return dto;
 }
 
 @Override
 public UserManagementDTO updateUser(Long id, UserManagementDTO dto) {
     Utilisateur user = utilisateurRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
     
     user.setNom(dto.getNom());
     user.setPrenom(dto.getPrenom());
     user.setEmail(dto.getEmail());
     
     if (user instanceof Etudiant && dto.getNiveau() != null) {
         ((Etudiant) user).setNiveau(dto.getNiveau());
     } else if (user instanceof Enseignant && dto.getSpecialite() != null) {
         ((Enseignant) user).setSpecialite(dto.getSpecialite());
     }
     
     utilisateurRepository.save(user);
     return getUserById(id);
 }
 
 @Override
 public void toggleUserStatus(Long id, boolean actif) {
     Utilisateur user = utilisateurRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
     user.setActif(actif);
     utilisateurRepository.save(user);
 }
 
 @Override
 public void deleteUser(Long id) {
     if (!utilisateurRepository.existsById(id)) {
         throw new ResourceNotFoundException("Utilisateur introuvable");
     }
     utilisateurRepository.deleteById(id);
 }
 
 // ================== GESTION DES COURS ==================
 
 @Override
 public List<CourseManagementDTO> getAllCoursesForAdmin() {
     return coursRepository.findAll().stream().map(this::toCourseManagementDTO)
             .collect(Collectors.toList());
 }
 
 // Version paginée pour les cours
 public Page<CourseManagementDTO> getAllCoursesForAdminPaginated(Pageable pageable) {
     return coursRepository.findAll(pageable).map(this::toCourseManagementDTO);
 }
 
 private CourseManagementDTO toCourseManagementDTO(Cours cours) {
     CourseManagementDTO dto = new CourseManagementDTO();
     dto.setId(cours.getId());
     dto.setTitre(cours.getTitre());
     dto.setDescription(cours.getDescription());
     dto.setArchive(cours.isArchive());
     dto.setDateCreation(cours.getDateCreation());
     
     if (cours.getEnseignant() != null) {
         dto.setEnseignantId(cours.getEnseignant().getId());
         dto.setEnseignantNom(cours.getEnseignant().getNom());
         dto.setEnseignantPrenom(cours.getEnseignant().getPrenom());
     }
     
     dto.setNombreInscriptions(cours.getInscriptions() != null ? cours.getInscriptions().size() : 0);
     dto.setNombreSections(cours.getSections() != null ? cours.getSections().size() : 0);
     
     int totalLecons = cours.getSections() != null ? 
             cours.getSections().stream()
                 .mapToInt(s -> s.getLecons() != null ? s.getLecons().size() : 0)
                 .sum() : 0;
     dto.setNombreLecons(totalLecons);
     
     dto.setNombreSessions((int) sessionRepository.findByCoursId(cours.getId()).size());
     
     Double moyenne = avisRepository.findAverageNoteForCours(cours.getId());
     dto.setMoyenneNotes(moyenne != null ? moyenne : 0.0);
     dto.setNombreAvis(cours.getAvis() != null ? cours.getAvis().size() : 0);
     
     Long inscriptionsTerminees = inscriptionRepository.countByCoursAndStatut(cours, StatutInscription.TERMINE);
     Long inscriptionsTotal = (long) (cours.getInscriptions() != null ? cours.getInscriptions().size() : 0);
     dto.setTauxCompletion(inscriptionsTotal > 0 ? (inscriptionsTerminees * 100.0 / inscriptionsTotal) : 0.0);
     
     return dto;
 }
 
 @Override
 public CourseManagementDTO getCourseDetailsForAdmin(Long coursId) {
     Cours cours = coursRepository.findById(coursId)
             .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable"));
     
     CourseManagementDTO dto = new CourseManagementDTO();
     dto.setId(cours.getId());
     dto.setTitre(cours.getTitre());
     dto.setDescription(cours.getDescription());
     dto.setArchive(cours.isArchive());
     dto.setDateCreation(cours.getDateCreation());
     
     if (cours.getEnseignant() != null) {
         dto.setEnseignantId(cours.getEnseignant().getId());
         dto.setEnseignantNom(cours.getEnseignant().getNom());
         dto.setEnseignantPrenom(cours.getEnseignant().getPrenom());
     }
     
     dto.setNombreInscriptions(cours.getInscriptions() != null ? cours.getInscriptions().size() : 0);
     dto.setNombreSections(cours.getSections() != null ? cours.getSections().size() : 0);
     dto.setNombreSessions((int) sessionRepository.findByCoursId(cours.getId()).size());
     
     Double moyenne = avisRepository.findAverageNoteForCours(cours.getId());
     dto.setMoyenneNotes(moyenne != null ? moyenne : 0.0);
     dto.setNombreAvis(cours.getAvis() != null ? cours.getAvis().size() : 0);
     
     return dto;
 }
 
 @Override
 public void archiveCourse(Long coursId) {
     Cours cours = coursRepository.findById(coursId)
             .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable"));
     cours.setArchive(true);
     coursRepository.save(cours);
 }
 
 @Override
 public void unarchiveCourse(Long coursId) {
     Cours cours = coursRepository.findById(coursId)
             .orElseThrow(() -> new ResourceNotFoundException("Cours introuvable"));
     cours.setArchive(false);
     coursRepository.save(cours);
 }
 
 @Override
 public void deleteCourse(Long coursId) {
     if (!coursRepository.existsById(coursId)) {
         throw new ResourceNotFoundException("Cours introuvable");
     }
     coursRepository.deleteById(coursId);
 }
 
 // ================== GESTION DES INSCRIPTIONS ==================
 
 @Override
 public List<InscriptionManagementDTO> getAllInscriptions() {
     return inscriptionRepository.findAll().stream().map(this::toInscriptionManagementDTO)
             .collect(Collectors.toList());
 }
 
 // Version paginée pour les inscriptions
 public Page<InscriptionManagementDTO> getAllInscriptionsPaginated(Pageable pageable) {
     return inscriptionRepository.findAll(pageable).map(this::toInscriptionManagementDTO);
 }
 
 @Override
 public List<InscriptionManagementDTO> getInscriptionsByCourse(Long coursId) {
     return inscriptionRepository.findByCoursId(coursId).stream()
             .map(this::toInscriptionManagementDTO)
             .collect(Collectors.toList());
 }
 
 @Override
 public List<InscriptionManagementDTO> getInscriptionsByStudent(Long etudiantId) {
     return inscriptionRepository.findByEtudiantId(etudiantId).stream()
             .map(this::toInscriptionManagementDTO)
             .collect(Collectors.toList());
 }
 
 @Override
 public void cancelInscription(Long inscriptionId) {
     Inscription inscription = inscriptionRepository.findById(inscriptionId)
             .orElseThrow(() -> new ResourceNotFoundException("Inscription introuvable"));
     inscription.setStatut(StatutInscription.ABANDONNE);
     inscriptionRepository.save(inscription);
 }
 
 private InscriptionManagementDTO toInscriptionManagementDTO(Inscription inscription) {
     InscriptionManagementDTO dto = new InscriptionManagementDTO();
     dto.setId(inscription.getId());
     
     if (inscription.getEtudiant() != null) {
         dto.setEtudiantId(inscription.getEtudiant().getId());
         dto.setEtudiantNom(inscription.getEtudiant().getNom());
         dto.setEtudiantPrenom(inscription.getEtudiant().getPrenom());
         dto.setEtudiantEmail(inscription.getEtudiant().getEmail());
     }
     
     if (inscription.getCours() != null) {
         dto.setCoursId(inscription.getCours().getId());
         dto.setCoursTitre(inscription.getCours().getTitre());
         
         if (inscription.getCours().getEnseignant() != null) {
             dto.setEnseignantNom(inscription.getCours().getEnseignant().getNom() + " " + 
                                  inscription.getCours().getEnseignant().getPrenom());
         }
     }
     
     dto.setStatut(inscription.getStatut());
     dto.setProgression(inscription.getProgression());
     dto.setDateInscription(inscription.getDateInscription());
     // Utiliser dateCompletion si disponible, sinon dateInscription
     dto.setDateDerniereActivite(inscription.getDateCompletion() != null ? inscription.getDateCompletion() : inscription.getDateInscription());
     
     int leconsCompletees = inscription.getProgressionLecons() != null ? inscription.getProgressionLecons().size() : 0;
     dto.setLeconsCompletees(leconsCompletees);
     
     int leconsTotal = 0;
     if (inscription.getCours() != null && inscription.getCours().getSections() != null) {
         leconsTotal = inscription.getCours().getSections().stream()
                 .mapToInt(s -> s.getLecons() != null ? s.getLecons().size() : 0)
                 .sum();
     }
     dto.setLeconsTotal(leconsTotal);
     
     return dto;
 }
}

