package com.fstm.ma.ilisi.appstreaming.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.config.AppProperties;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportContactRequest;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestSubject;

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
    String body =
        "Pour reinitialiser votre mot de passe, cliquez sur le lien ci-dessous :\n"
            + resetUrl
            + "\n\nCe lien expire dans 5 minutes.";
    sendMail(to, "Reinitialisation de votre mot de passe", body);
  }

  public void sendSupportRequestConfirmation(
      String to,
      String fullName,
      SupportRequestSubject subject,
      Long requestId) {
    String subjectLabel = subject != null ? subject.getLabel() : "Support";
    String name = (fullName == null || fullName.isBlank()) ? "Utilisateur" : fullName;
    String body =
        "Bonjour "
            + name
            + ",\n\n"
            + "Nous avons bien recu votre demande de support.\n"
            + "Numero de demande: #"
            + requestId
            + "\n"
            + "Sujet: "
            + subjectLabel
            + "\n\n"
            + "Notre equipe vous repondra dans les plus brefs delais.\n\n"
            + "Cordialement,\n"
            + "Equipe Support";
    sendMail(to, "Confirmation de votre demande de support", body);
  }

  public void sendSupportRequestNotification(String to, SupportContactRequest request) {
    if (to == null || to.isBlank() || request == null) {
      return;
    }

    String subjectLabel = request.getSubject() != null ? request.getSubject().getLabel() : "Support";
    String body =
        "Nouvelle demande de support recue.\n\n"
            + "ID: #"
            + request.getId()
            + "\n"
            + "Nom: "
            + request.getFullName()
            + "\n"
            + "Email: "
            + request.getEmail()
            + "\n"
            + "Sujet: "
            + subjectLabel
            + "\n"
            + "Source: "
            + request.getSourcePage()
            + "\n\n"
            + "Message:\n"
            + request.getMessage();
    sendMail(to, "Nouvelle demande de support #" + request.getId(), body);
  }

  public void sendNewsletterWelcomeMail(String to) {
    String body =
        "Bienvenue dans notre newsletter.\n\n"
            + "Vous recevrez nos actualites, conseils et nouvelles ressources pedagogiques.\n"
            + "Vous pouvez vous desabonner a tout moment depuis le lien present dans nos emails.\n\n"
            + "Merci pour votre confiance.";
    sendMail(to, "Bienvenue a la newsletter", body);
  }

  private void sendMail(String to, String subject, String body) {
    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setFrom(appProperties.getMailFrom());
    msg.setTo(to);
    msg.setSubject(subject);
    msg.setText(body);

    try {
      mailSender.send(msg);
    } catch (Exception ex) {
      if (failOnError) {
        throw ex;
      }
      log.warn("SMTP indisponible en dev, email non envoye pour {}", to);
      log.info("Sujet email (dev): {}", subject);
      log.debug("Contenu email (dev): {}", body);
    }
  }
}
