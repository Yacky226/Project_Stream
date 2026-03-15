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
public class ContactRequestResponseDTO {
    private Long id;
    private String email;
    private SupportRequestSubject subject;
    private String subjectLabel;
    private SupportRequestStatus status;
    private LocalDateTime createdAt;
}
