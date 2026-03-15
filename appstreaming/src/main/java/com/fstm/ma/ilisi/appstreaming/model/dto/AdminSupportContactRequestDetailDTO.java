package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.time.LocalDateTime;

import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestStatus;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestSubject;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminSupportContactRequestDetailDTO {
    private Long id;
    private String fullName;
    private String email;
    private SupportRequestSubject subject;
    private String subjectLabel;
    private String message;
    private SupportRequestStatus status;
    private String sourcePage;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private Long assignedAdminId;
    private String assignedAdminName;
    private String internalNote;
    private String lastAdminReply;
    private LocalDateTime repliedAt;
    private Long respondedByAdminId;
    private String respondedByAdminName;
}
