package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpCenterCategoryDTO {
    private String id;
    private String title;
    private String description;
    private String icon;
    private String actionType;
    private String actionValue;
}
