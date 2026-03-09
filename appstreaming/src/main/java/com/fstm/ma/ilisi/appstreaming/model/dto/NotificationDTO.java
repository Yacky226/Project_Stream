package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {

	@NotNull
    private Long id;

    @NotBlank
    private String message;

    @NotNull
    private boolean lu;

    @NotNull
    private LocalDateTime date;

    @NotNull
    private Long destinataireId;
}
