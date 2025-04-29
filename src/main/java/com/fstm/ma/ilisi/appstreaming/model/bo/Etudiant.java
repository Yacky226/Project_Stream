package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Entity
@Data
public class Etudiant extends Utilisateur {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@NotBlank
	@Column(nullable=false)
	private String niveau;
}
