package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HelpCenterContentDTO {
    private List<HelpCenterCategoryDTO> categories;
    private List<HelpCenterFaqDTO> faqs;
    private String supportEmail;
    private String responseWindow;
    private int resolutionRate;
}
