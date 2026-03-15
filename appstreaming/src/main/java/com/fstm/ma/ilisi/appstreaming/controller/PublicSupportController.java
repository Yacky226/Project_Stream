package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.ApiResponse;
import com.fstm.ma.ilisi.appstreaming.model.dto.ContactRequestCreateDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ContactRequestResponseDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.HelpCenterContentDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.NewsletterSubscriptionRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.NewsletterSubscriptionResponseDTO;
import com.fstm.ma.ilisi.appstreaming.service.PublicSupportService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/support")
public class PublicSupportController {

    private final PublicSupportService publicSupportService;

    public PublicSupportController(PublicSupportService publicSupportService) {
        this.publicSupportService = publicSupportService;
    }

    @GetMapping("/help-center")
    public ResponseEntity<ApiResponse<HelpCenterContentDTO>> getHelpCenterContent() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Centre d'aide charge avec succes",
                        publicSupportService.getHelpCenterContent()));
    }

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<ContactRequestResponseDTO>> submitContactRequest(
            @Valid @RequestBody ContactRequestCreateDTO request,
            HttpServletRequest httpRequest) {
        ContactRequestResponseDTO response = publicSupportService.submitContactRequest(
                request,
                getClientIP(httpRequest),
                httpRequest.getHeader("User-Agent"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Votre message a bien ete envoye. Notre equipe vous recontactera rapidement.",
                        response));
    }

    @PostMapping("/newsletter")
    public ResponseEntity<ApiResponse<NewsletterSubscriptionResponseDTO>> subscribeToNewsletter(
            @Valid @RequestBody NewsletterSubscriptionRequestDTO request) {
        NewsletterSubscriptionResponseDTO response = publicSupportService.subscribeToNewsletter(request);
        String message = response.isReactivated()
                ? "Votre abonnement a ete reactive avec succes."
                : "Votre inscription a la newsletter est confirmee.";

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    private String getClientIP(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        return request.getRemoteAddr();
    }
}
