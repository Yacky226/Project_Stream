package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Etudiant extends Utilisateur {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@NotBlank
	@Column(nullable=false)
	private String niveau;

	@OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Inscription> inscriptions = new ArrayList<>();

	@OneToMany(mappedBy = "etudiant", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Avis> avisListe = new ArrayList<>();
}
