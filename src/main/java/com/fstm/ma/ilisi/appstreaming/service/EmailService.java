package com.fstm.ma.ilisi.appstreaming.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.config.AppProperties;

import lombok.Data;

@Service
@Data
public class EmailService {
  private final JavaMailSender mailSender;
  private final AppProperties appProperties;

  public void sendPasswordResetMail(String to, String token) {
	  String resetUrl = appProperties.getFrontendUrl() + "/reset-password?token=" + token;
      SimpleMailMessage msg = new SimpleMailMessage();
      msg.setFrom(appProperties.getMailFrom());

	    msg.setTo(to);
	    msg.setSubject("Réinitialisation de votre mot de passe");
	    msg.setText("Pour réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :\n"
	                + resetUrl + "\n\nCe lien expire dans 5 minutes.");
	    mailSender.send(msg);
  }
}
