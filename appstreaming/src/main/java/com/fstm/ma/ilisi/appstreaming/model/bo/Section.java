package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Section implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titre;

    @Column(length = 1000)
    private String description;

    @NotNull
    @Column(nullable = false)
    private Integer ordre;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "cours_id", nullable = false)
    private Cours cours;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordre ASC")
    private List<Lecon> lecons = new ArrayList<>();
}
