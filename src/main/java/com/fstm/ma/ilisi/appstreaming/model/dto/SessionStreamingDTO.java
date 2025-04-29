package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionStreamingDTO {

	@NotNull
    private Long id;

    @NotNull
    private LocalDateTime dateHeure;

    @NotNull
    private boolean estEnDirect;

    @NotNull
    private String videoUrl;

    @NotNull
    private Long coursId;
}
