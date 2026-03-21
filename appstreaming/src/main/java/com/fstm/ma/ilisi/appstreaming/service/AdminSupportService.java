package com.fstm.ma.ilisi.appstreaming.service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fstm.ma.ilisi.appstreaming.model.bo.NewsletterSubscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportContactRequest;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestStatus;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminNewsletterSubscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportContactRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportContactRequestDetailDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportOverviewDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.PageResponse;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestReplyDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestStatusUpdateDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestWorkflowUpdateDTO;
import com.fstm.ma.ilisi.appstreaming.repository.NewsletterSubscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SupportContactRequestRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;

@Service
public class AdminSupportService {

    private static final Set<SupportRequestStatus> PENDING_STATUSES =
            Set.of(SupportRequestStatus.NEW, SupportRequestStatus.IN_PROGRESS);

    private final SupportContactRequestRepository contactRepository;
    private final NewsletterSubscriptionRepository newsletterRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AdminSupportService(
            SupportContactRequestRepository contactRepository,
            NewsletterSubscriptionRepository newsletterRepository,
            UtilisateurRepository utilisateurRepository) {
        this.contactRepository = contactRepository;
        this.newsletterRepository = newsletterRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ==================== OVERVIEW ====================

    public AdminSupportOverviewDTO getOverview() {
        long total = contactRepository.count();
        long newCount = contactRepository.countByStatus(SupportRequestStatus.NEW);
        long inProgress = contactRepository.countByStatus(SupportRequestStatus.IN_PROGRESS);
        long resolved = contactRepository.countByStatus(SupportRequestStatus.RESOLVED);
        long closed = contactRepository.countByStatus(SupportRequestStatus.CLOSED);
        long pending = contactRepository.countByStatusIn(PENDING_STATUSES);

        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long monthlyContacts = contactRepository.countByCreatedAtAfter(monthStart);

        long totalNewsletter = newsletterRepository.count();
        long activeNewsletter = newsletterRepository.countByActive(true);
        long inactiveNewsletter = newsletterRepository.countByActive(false);
        long monthlyNewsletter = newsletterRepository.countBySubscribedAtAfter(monthStart);

        return new AdminSupportOverviewDTO(
                total,
                pending,
                newCount,
                inProgress,
                resolved,
                closed,
                monthlyContacts,
                totalNewsletter,
                activeNewsletter,
                inactiveNewsletter,
                monthlyNewsletter);
    }

    // ==================== CONTACT REQUESTS ====================

    public PageResponse<AdminSupportContactRequestDTO> getContacts(
            SupportRequestStatus status, String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? "" : search.trim();
        Page<SupportContactRequest> page = contactRepository.findAllForAdmin(status, normalizedSearch, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::toContactDTO).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements());
    }

    public AdminSupportContactRequestDetailDTO getContactById(Long id) {
        SupportContactRequest entity = contactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de contact introuvable: " + id));
        return toDetailDTO(entity);
    }

    @Transactional
    public void updateContactStatus(Long id, SupportRequestStatusUpdateDTO dto) {
        SupportContactRequest entity = contactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de contact introuvable: " + id));
        entity.setStatus(dto.getStatus());
        entity.setProcessedAt(LocalDateTime.now());
        contactRepository.save(entity);
    }

    @Transactional
    public void updateContactWorkflow(Long id, SupportRequestWorkflowUpdateDTO dto) {
        SupportContactRequest entity = contactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de contact introuvable: " + id));

        entity.setStatus(dto.getStatus());
        entity.setInternalNote(dto.getInternalNote());
        entity.setProcessedAt(LocalDateTime.now());

        if (dto.getAssignedAdminId() != null) {
            Utilisateur admin = utilisateurRepository.findById(dto.getAssignedAdminId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Administrateur introuvable: " + dto.getAssignedAdminId()));
            entity.setAssignedAdmin(admin);
        } else {
            entity.setAssignedAdmin(null);
        }

        contactRepository.save(entity);
    }

    @Transactional
    public void replyToContact(Long id, SupportRequestReplyDTO dto, Long adminId) {
        SupportContactRequest entity = contactRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Demande de contact introuvable: " + id));

        entity.setLastAdminReply(dto.getMessage());
        entity.setRepliedAt(LocalDateTime.now());
        entity.setProcessedAt(LocalDateTime.now());

        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }

        if (adminId != null) {
            utilisateurRepository.findById(adminId).ifPresent(entity::setRespondedByAdmin);
        }

        contactRepository.save(entity);
    }

    // ==================== NEWSLETTER ====================

    public PageResponse<AdminNewsletterSubscriptionDTO> getNewsletterSubscriptions(
            Boolean active, String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? "" : search.trim();
        Page<NewsletterSubscription> page = newsletterRepository.findAllForAdmin(active, normalizedSearch, pageable);

        return new PageResponse<>(
                page.getContent().stream().map(this::toNewsletterDTO).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements());
    }

    // ==================== MAPPERS ====================

    private AdminSupportContactRequestDTO toContactDTO(SupportContactRequest entity) {
        AdminSupportContactRequestDTO dto = new AdminSupportContactRequestDTO();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setSubject(entity.getSubject());
        dto.setSubjectLabel(entity.getSubject() != null ? entity.getSubject().getLabel() : null);
        dto.setMessage(entity.getMessage());
        dto.setStatus(entity.getStatus());
        dto.setSourcePage(entity.getSourcePage());
        dto.setIpAddress(entity.getIpAddress());
        dto.setUserAgent(entity.getUserAgent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setProcessedAt(entity.getProcessedAt());
        dto.setRepliedAt(entity.getRepliedAt());

        if (entity.getAssignedAdmin() != null) {
            dto.setAssignedAdminId(entity.getAssignedAdmin().getId());
            dto.setAssignedAdminName(
                    entity.getAssignedAdmin().getPrenom() + " " + entity.getAssignedAdmin().getNom());
        }

        return dto;
    }

    private AdminSupportContactRequestDetailDTO toDetailDTO(SupportContactRequest entity) {
        AdminSupportContactRequestDetailDTO dto = new AdminSupportContactRequestDetailDTO();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setSubject(entity.getSubject());
        dto.setSubjectLabel(entity.getSubject() != null ? entity.getSubject().getLabel() : null);
        dto.setMessage(entity.getMessage());
        dto.setStatus(entity.getStatus());
        dto.setSourcePage(entity.getSourcePage());
        dto.setIpAddress(entity.getIpAddress());
        dto.setUserAgent(entity.getUserAgent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setProcessedAt(entity.getProcessedAt());
        dto.setRepliedAt(entity.getRepliedAt());
        dto.setInternalNote(entity.getInternalNote());
        dto.setLastAdminReply(entity.getLastAdminReply());

        if (entity.getAssignedAdmin() != null) {
            dto.setAssignedAdminId(entity.getAssignedAdmin().getId());
            dto.setAssignedAdminName(
                    entity.getAssignedAdmin().getPrenom() + " " + entity.getAssignedAdmin().getNom());
        }

        if (entity.getRespondedByAdmin() != null) {
            dto.setRespondedByAdminId(entity.getRespondedByAdmin().getId());
            dto.setRespondedByAdminName(
                    entity.getRespondedByAdmin().getPrenom() + " " + entity.getRespondedByAdmin().getNom());
        }

        return dto;
    }

    private AdminNewsletterSubscriptionDTO toNewsletterDTO(NewsletterSubscription entity) {
        AdminNewsletterSubscriptionDTO dto = new AdminNewsletterSubscriptionDTO();
        dto.setId(entity.getId());
        dto.setEmail(entity.getEmail());
        dto.setActive(entity.isActive());
        dto.setSourcePage(entity.getSourcePage());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setSubscribedAt(entity.getSubscribedAt());
        dto.setUnsubscribedAt(entity.getUnsubscribedAt());
        return dto;
    }
}
