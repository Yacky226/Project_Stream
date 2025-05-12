package com.fstm.ma.ilisi.appstreaming.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.model.bo.PasswordResetToken;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.repository.PasswordResetTokenRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;

@Service
public class PasswordResetService {
  private final PasswordResetTokenRepository tokenRepo;
  private final UtilisateurRepository userRepo;
  private final PasswordEncoder encoder;
  private final EmailService emailService;
  
  public PasswordResetService(PasswordResetTokenRepository tokenRepo,UtilisateurRepository userRepo,
		  PasswordEncoder encoder,EmailService emailService) {
	  this.tokenRepo=tokenRepo;
	  this.userRepo=userRepo;
	  this.encoder=encoder;
	  this.emailService=emailService;
	  
  }

  public void createPasswordResetToken(String email) {
    Utilisateur user = userRepo.findByEmail(email)
      .orElseThrow(() -> new ResourceNotFoundException("Email non trouvé"));
    
 // Vérifier si un token existe déjà pour cet utilisateur
    PasswordResetToken existingToken = tokenRepo.findByUtilisateurId(user.getId());
    if (existingToken != null) {
        // Supprimer le token existant
    	tokenRepo.delete(existingToken);
    }
    String token = UUID.randomUUID().toString();
    PasswordResetToken prt = new PasswordResetToken();
    prt.setToken(token);
    prt.setUtilisateur(user);
    prt.setExpiryDate(calculateExpiryDateInMinutes(5));
    tokenRepo.save(prt);
    emailService.sendPasswordResetMail(user.getEmail(), token);
  }

  public void resetPassword(String token, String newPassword) {
    PasswordResetToken prt = tokenRepo.findByToken(token)
      .orElseThrow(() -> new ResourceNotFoundException("Token invalide"));
    if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
      throw new RuntimeException("Token expiré");
    }
    Utilisateur user = prt.getUtilisateur();
    user.setPassword(encoder.encode(newPassword));
    userRepo.save(user);
    tokenRepo.delete(prt);
  }
  public LocalDateTime calculateExpiryDateInMinutes(int minutes) {
	    return LocalDateTime.now().plusMinutes(minutes);
	}

}

