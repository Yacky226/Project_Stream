package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSupportOverviewDTO {
    private long totalContactRequests;
    private long pendingContactRequests;
    private long newContactRequests;
    private long inProgressContactRequests;
    private long resolvedContactRequests;
    private long closedContactRequests;
    private long monthlyContactRequests;
    private long totalNewsletterSubscriptions;
    private long activeNewsletterSubscriptions;
    private long inactiveNewsletterSubscriptions;
    private long monthlyNewsletterSubscriptions;
}
