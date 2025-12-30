package com.fstm.ma.ilisi.appstreaming.service;

import java.util.List;

import com.fstm.ma.ilisi.appstreaming.model.dto.AdministrateurDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.CourseManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.DashboardStatsDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.InscriptionManagementDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserManagementDTO;

public interface AdministrateurServiceInterface {
	 AdministrateurDTO ajouterAdministrateur(AdministrateurDTO dto);
	 List<AdministrateurDTO> getTousLesAdministrateurs();
	 AdministrateurDTO getAdministrateurParId(Long id);
	 void supprimerAdministrateur(Long id);
	 
	 // Dashboard et statistiques
	 DashboardStatsDTO getDashboardStats();
	 
	 // Gestion des utilisateurs
	 List<UserManagementDTO> getAllUsers();
	 UserManagementDTO getUserById(Long id);
	 UserManagementDTO updateUser(Long id, UserManagementDTO dto);
	 void toggleUserStatus(Long id, boolean actif);
	 void deleteUser(Long id);
	 
	 // Gestion des cours
	 List<CourseManagementDTO> getAllCoursesForAdmin();
	 CourseManagementDTO getCourseDetailsForAdmin(Long coursId);
	 void archiveCourse(Long coursId);
	 void unarchiveCourse(Long coursId);
	 void deleteCourse(Long coursId);
	 
	 // Gestion des inscriptions
	 List<InscriptionManagementDTO> getAllInscriptions();
	 List<InscriptionManagementDTO> getInscriptionsByCourse(Long coursId);
	 List<InscriptionManagementDTO> getInscriptionsByStudent(Long etudiantId);
	 void cancelInscription(Long inscriptionId);
	}
