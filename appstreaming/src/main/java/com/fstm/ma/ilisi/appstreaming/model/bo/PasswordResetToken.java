package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Data
@Entity
public class PasswordResetToken {
    @Id @GeneratedValue
    private Long id;
    private String token;
    @OneToOne
    private Utilisateur utilisateur;
    private LocalDateTime expiryDate;
   
}
