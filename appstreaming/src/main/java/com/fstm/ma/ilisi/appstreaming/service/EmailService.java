package com.fstm.ma.ilisi.appstreaming.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.config.AppProperties;

import lombok.Data;

@Service
@Data
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final AppProperties appProperties;

  @Value("${app.mail.fail-on-error:true}")
  private boolean failOnError;

  public void sendPasswordResetMail(String to, String token) {
    String resetUrl = appProperties.getFrontendUrl() + "/reset-password?token=" + token;
    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setFrom(appProperties.getMailFrom());
    msg.setTo(to);
    msg.setSubject("Reinitialisation de votre mot de passe");
    msg.setText(
        "Pour reinitialiser votre mot de passe, cliquez sur le lien ci-dessous :\n"
            + resetUrl
            + "\n\nCe lien expire dans 5 minutes.");

    try {
      mailSender.send(msg);
    } catch (Exception ex) {
      if (failOnError) {
        throw ex;
      }

      log.warn("SMTP indisponible en dev, email non envoye pour {}", to);
      log.info("Lien de reinitialisation (dev): {}", resetUrl);
    }
  }
}
