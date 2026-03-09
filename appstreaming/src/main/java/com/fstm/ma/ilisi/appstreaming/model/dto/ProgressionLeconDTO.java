package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProgressionLeconDTO {
    
    @NotNull
    private Long inscriptionId;
    
    @NotNull
    private Long leconId;
    
    private String leconTitre;
    
    @NotNull
    private Boolean termine;
    
    private LocalDateTime dateCompletion;
}
