package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscriptionResponseDTO {
    private String email;
    private boolean active;
    private boolean reactivated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
