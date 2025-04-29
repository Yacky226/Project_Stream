package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Entity
@Data
public class Enseignant extends Utilisateur {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	@NotBlank
	@Column(nullable=false)
	private String specialite;
	
	@OneToMany(mappedBy = "enseignant")
	private List<Cours> cours;

	
}

