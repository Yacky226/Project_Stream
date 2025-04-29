package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class HistoriqueDTO {

	@NotNull
    private Long id;

    @NotNull
    private LocalDateTime dateVisionnage;

    @NotNull
    private Long etudiantId;

    @NotNull
    private Long coursId;
}
