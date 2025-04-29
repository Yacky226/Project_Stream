package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.io.Serializable;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
public class Cours implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@NotBlank
    @Column(nullable = false)
	private String titre;
	
	@NotBlank
    @Column(nullable = false)
	private String description;
	
	@NotBlank
    @Column(nullable = false)
	private String categorie;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime horaire;
	
    @NotNull
    @ManyToOne
    @JoinColumn(nullable = false)
    private Enseignant enseignant;
}
