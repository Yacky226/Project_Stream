package com.fstm.ma.ilisi.appstreaming.controller;

import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminNewsletterSubscriptionDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportContactRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportContactRequestDetailDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.AdminSupportOverviewDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.PageResponse;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestReplyDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestStatusUpdateDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.SupportRequestWorkflowUpdateDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import com.fstm.ma.ilisi.appstreaming.service.AdminSupportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/support")
@PreAuthorize("hasAuthority('ADMINISTRATEUR')")
public class AdminSupportController {

    private static final Set<String> CONTACT_SORT_FIELDS =
            Set.of("createdAt", "status", "email", "fullName", "id");
    private static final Set<String> NEWSLETTER_SORT_FIELDS =
            Set.of("updatedAt", "email", "subscribedAt", "id", "createdAt");

    private final AdminSupportService adminSupportService;
    private final UtilisateurRepository utilisateurRepository;

    public AdminSupportController(
            AdminSupportService adminSupportService,
            UtilisateurRepository utilisateurRepository) {
        this.adminSupportService = adminSupportService;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ==================== OVERVIEW ====================

    @GetMapping("/overview")
    public ResponseEntity<AdminSupportOverviewDTO> getOverview() {
        return ResponseEntity.ok(adminSupportService.getOverview());
    }

    // ==================== CONTACT REQUESTS ====================

    @GetMapping("/contacts")
    public ResponseEntity<PageResponse<AdminSupportContactRequestDTO>> getContacts(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "12") int size,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) SupportRequestStatus status,
            @RequestParam(required = false) String search) {

        String safeSortBy = CONTACT_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);

        return ResponseEntity.ok(adminSupportService.getContacts(status, search, pageable));
    }

    @GetMapping("/contacts/{id}")
    public ResponseEntity<AdminSupportContactRequestDetailDTO> getContactById(
            @PathVariable Long id) {
        return ResponseEntity.ok(adminSupportService.getContactById(id));
    }

    @PatchMapping("/contacts/{id}/status")
    public ResponseEntity<Void> updateContactStatus(
            @PathVariable Long id,
            @Valid @RequestBody SupportRequestStatusUpdateDTO payload) {
        adminSupportService.updateContactStatus(id, payload);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/contacts/{id}/workflow")
    public ResponseEntity<Void> updateContactWorkflow(
            @PathVariable Long id,
            @Valid @RequestBody SupportRequestWorkflowUpdateDTO payload) {
        adminSupportService.updateContactWorkflow(id, payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/contacts/{id}/reply")
    public ResponseEntity<Void> replyToContact(
            @PathVariable Long id,
            @Valid @RequestBody SupportRequestReplyDTO payload,
            @AuthenticationPrincipal UserDetails principal) {
        Long adminId = resolveAdminId(principal);
        adminSupportService.replyToContact(id, payload, adminId);
        return ResponseEntity.ok().build();
    }

    // ==================== NEWSLETTER ====================

    @GetMapping("/newsletter")
    public ResponseEntity<PageResponse<AdminNewsletterSubscriptionDTO>> getNewsletterSubscriptions(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "8") int size,
            @RequestParam(required = false, defaultValue = "updatedAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDir,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {

        String safeSortBy = NEWSLETTER_SORT_FIELDS.contains(sortBy) ? sortBy : "updatedAt";
        Sort sort = sortDir.equalsIgnoreCase("ASC")
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), sort);

        return ResponseEntity.ok(adminSupportService.getNewsletterSubscriptions(active, search, pageable));
    }

    // ==================== HELPERS ====================

    private Long resolveAdminId(UserDetails principal) {
        if (principal == null) {
            return null;
        }
        try {
            String username = principal.getUsername();
            return utilisateurRepository.findByEmail(username)
                    .map(u -> u.getId())
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
