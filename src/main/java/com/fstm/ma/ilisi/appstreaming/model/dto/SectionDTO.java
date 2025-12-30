package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SectionDTO {
    
    private Long id;
    
    @NotBlank
    private String titre;
    
    private String description;
    
    @NotNull
    private Integer ordre;
    
    @NotNull
    private Long coursId;
    
    private List<LeconDTO> lecons;
}
