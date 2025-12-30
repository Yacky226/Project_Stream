package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
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
    @Column(nullable = false, length = 2000)
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

	@Column(nullable = false)
	private boolean archive = false;

	@Column(length = 500)
	private String imageUrl;

	@Column
	private Integer dureeEstimeeHeures;

	@Column(nullable = false)
	private LocalDateTime dateCreation;

	@OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("ordre ASC")
	private List<Section> sections = new ArrayList<>();

	@OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Inscription> inscriptions = new ArrayList<>();

	@OneToMany(mappedBy = "cours", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Avis> avis = new ArrayList<>();

	@OneToMany(mappedBy = "cours", cascade = CascadeType.ALL)
	private List<Ressource> ressources = new ArrayList<>();

	@PrePersist
	protected void onCreate() {
		if (dateCreation == null) {
			dateCreation = LocalDateTime.now();
		}
	}
}
