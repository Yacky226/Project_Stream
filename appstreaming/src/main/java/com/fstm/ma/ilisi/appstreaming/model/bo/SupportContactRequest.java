package com.fstm.ma.ilisi.appstreaming.model.bo;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(
    name = "support_contact_request",
    indexes = {
        @Index(name = "idx_support_contact_request_created_at", columnList = "created_at"),
        @Index(name = "idx_support_contact_request_status", columnList = "status"),
        @Index(name = "idx_support_contact_request_email", columnList = "email")
    })
@Data
public class SupportContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private SupportRequestSubject subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SupportRequestStatus status = SupportRequestStatus.NEW;

    @Column(name = "source_page", nullable = false, length = 64)
    private String sourcePage = "CONTACT_PAGE";

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private Utilisateur assignedAdmin;

    @Column(name = "internal_note", columnDefinition = "TEXT")
    private String internalNote;

    @Column(name = "last_admin_reply", columnDefinition = "TEXT")
    private String lastAdminReply;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responded_by_admin_id")
    private Utilisateur respondedByAdmin;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = SupportRequestStatus.NEW;
        }
        if (sourcePage == null || sourcePage.isBlank()) {
            sourcePage = "CONTACT_PAGE";
        }
    }
}
