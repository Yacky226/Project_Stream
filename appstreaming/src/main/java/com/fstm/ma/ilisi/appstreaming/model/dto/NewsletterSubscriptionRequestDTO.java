package com.fstm.ma.ilisi.appstreaming.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NewsletterSubscriptionRequestDTO {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @Size(max = 64)
    private String sourcePage;
}
