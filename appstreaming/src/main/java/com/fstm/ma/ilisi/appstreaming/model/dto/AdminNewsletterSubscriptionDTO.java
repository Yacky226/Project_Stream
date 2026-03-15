package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNewsletterSubscriptionDTO {
    private Long id;
    private String email;
    private boolean active;
    private String sourcePage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime subscribedAt;
    private LocalDateTime unsubscribedAt;
}
