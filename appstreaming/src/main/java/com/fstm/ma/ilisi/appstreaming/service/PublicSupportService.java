package com.fstm.ma.ilisi.appstreaming.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.fstm.ma.ilisi.appstreaming.config.AppProperties;
import com.fstm.ma.ilisi.appstreaming.model.bo.NewsletterSubscription;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportContactRequest;
import com.fstm.ma.ilisi.appstreaming.model.bo.SupportRequestStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.ContactRequestCreateDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ContactRequestResponseDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.HelpCenterCategoryDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.HelpCenterContentDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.HelpCenterFaqDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.NewsletterSubscriptionRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.NewsletterSubscriptionResponseDTO;
import com.fstm.ma.ilisi.appstreaming.repository.NewsletterSubscriptionRepository;
import com.fstm.ma.ilisi.appstreaming.repository.SupportContactRequestRepository;

@Service
public class PublicSupportService {

    private static final Logger log = LoggerFactory.getLogger(PublicSupportService.class);

    private final SupportContactRequestRepository supportContactRequestRepository;
    private final NewsletterSubscriptionRepository newsletterSubscriptionRepository;
    private final EmailService emailService;
    private final AppProperties appProperties;

    public PublicSupportService(
            SupportContactRequestRepository supportContactRequestRepository,
            NewsletterSubscriptionRepository newsletterSubscriptionRepository,
            EmailService emailService,
            AppProperties appProperties) {
        this.supportContactRequestRepository = supportContactRequestRepository;
        this.newsletterSubscriptionRepository = newsletterSubscriptionRepository;
        this.emailService = emailService;
        this.appProperties = appProperties;
    }

    public HelpCenterContentDTO getHelpCenterContent() {
        return new HelpCenterContentDTO(
                buildHelpCenterCategories(),
                buildHelpCenterFaqs(),
                resolveSupportEmail(),
                "Response within 24 hours",
                98);
    }

    public ContactRequestResponseDTO submitContactRequest(
            ContactRequestCreateDTO request,
            String ipAddress,
            String userAgent) {
        SupportContactRequest entity = new SupportContactRequest();
        entity.setFullName(normalizeSpaces(request.getFullName()));
        entity.setEmail(normalizeEmail(request.getEmail()));
        entity.setSubject(request.getSubject());
        entity.setMessage(request.getMessage().trim());
        entity.setStatus(SupportRequestStatus.NEW);
        entity.setSourcePage(normalizeSourcePage(request.getSourcePage(), "CONTACT_PAGE"));
        entity.setIpAddress(ipAddress);
        entity.setUserAgent(truncate(userAgent, 512));

        SupportContactRequest saved = supportContactRequestRepository.save(entity);

        try {
            emailService.sendSupportRequestConfirmation(
                    saved.getEmail(),
                    saved.getFullName(),
                    saved.getSubject(),
                    saved.getId());
            emailService.sendSupportRequestNotification(resolveSupportEmail(), saved);
        } catch (Exception ex) {
            log.warn("Impossible d'envoyer les emails de support pour la demande {}", saved.getId(), ex);
        }

        return new ContactRequestResponseDTO(
                saved.getId(),
                saved.getEmail(),
                saved.getSubject(),
                saved.getSubject().getLabel(),
                saved.getStatus(),
                saved.getCreatedAt());
    }

    public NewsletterSubscriptionResponseDTO subscribeToNewsletter(NewsletterSubscriptionRequestDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String sourcePage = normalizeSourcePage(request.getSourcePage(), "HELP_CENTER");

        Optional<NewsletterSubscription> existingOpt =
                newsletterSubscriptionRepository.findByEmailIgnoreCase(normalizedEmail);

        boolean reactivated = false;
        boolean shouldSendEmail = false;
        NewsletterSubscription subscription;

        if (existingOpt.isPresent()) {
            subscription = existingOpt.get();
            if (!subscription.isActive()) {
                reactivated = true;
                shouldSendEmail = true;
                subscription.setSubscribedAt(LocalDateTime.now());
                subscription.setUnsubscribedAt(null);
            }

            subscription.setActive(true);
            subscription.setSourcePage(sourcePage);
        } else {
            subscription = new NewsletterSubscription();
            subscription.setEmail(normalizedEmail);
            subscription.setActive(true);
            subscription.setSourcePage(sourcePage);
            shouldSendEmail = true;
        }

        NewsletterSubscription saved = newsletterSubscriptionRepository.save(subscription);

        if (shouldSendEmail) {
            try {
                emailService.sendNewsletterWelcomeMail(saved.getEmail());
            } catch (Exception ex) {
                log.warn("Impossible d'envoyer l'email newsletter pour {}", saved.getEmail(), ex);
            }
        }

        return new NewsletterSubscriptionResponseDTO(
                saved.getEmail(),
                saved.isActive(),
                reactivated,
                saved.getCreatedAt(),
                saved.getUpdatedAt());
    }

    private List<HelpCenterCategoryDTO> buildHelpCenterCategories() {
        return List.of(
                new HelpCenterCategoryDTO(
                        "getting-started",
                        "Getting Started",
                        "Master the basics: setting up your profile, joining classes, and choosing your first course.",
                        "sparkles",
                        "navigate",
                        "/auth/signup/student"),
                new HelpCenterCategoryDTO(
                        "billing",
                        "Account & Billing",
                        "Manage subscriptions, update payment methods, and download invoices easily.",
                        "credit-card",
                        "navigate",
                        "/contact"),
                new HelpCenterCategoryDTO(
                        "course-access",
                        "Course Access",
                        "Issues with video playback, course unlocking, or resource downloads? Find help here.",
                        "graduation-cap",
                        "navigate",
                        "/catalog"),
                new HelpCenterCategoryDTO(
                        "mobile",
                        "Mobile App",
                        "Tips for offline learning, mobile sync, and push notifications on iOS and Android.",
                        "smartphone",
                        "navigate",
                        "/mobile-app"),
                new HelpCenterCategoryDTO(
                        "certifications",
                        "Certifications",
                        "How to claim your certificate, share on LinkedIn, and verify credentials.",
                        "check-circle-2",
                        "scroll",
                        "faq-section"),
                new HelpCenterCategoryDTO(
                        "technical",
                        "Technical Support",
                        "Hardware requirements, browser compatibility, and platform speed optimization.",
                        "wrench",
                        "navigate",
                        "/contact"));
    }

    private List<HelpCenterFaqDTO> buildHelpCenterFaqs() {
        return List.of(
                new HelpCenterFaqDTO(
                        "offline-viewing",
                        "Can I download courses for offline viewing?",
                        "Yes. Our mobile app supports offline viewing. Open the course in the app, tap the download icon, and your lessons will be available without an internet connection.",
                        "mobile"),
                new HelpCenterFaqDTO(
                        "refund-policy",
                        "What is your refund policy?",
                        "We offer a 30-day money-back guarantee for individual course purchases. Subscription plans can be cancelled anytime and remain active until the end of the billing cycle.",
                        "billing"),
                new HelpCenterFaqDTO(
                        "certificates",
                        "Are certificates recognized by employers?",
                        "Our certificates are verified and designed to highlight specific competencies. Many learners share them with recruiters and on LinkedIn as proof of practical skill growth.",
                        "certifications"),
                new HelpCenterFaqDTO(
                        "account-sharing",
                        "Can I share my account with others?",
                        "Account sharing is not allowed because progress, certificates, and recommendations are personalized. If you need multi-user access, we recommend a team or family-style plan via our support team.",
                        "billing"),
                new HelpCenterFaqDTO(
                        "reset-password",
                        "How do I reset my password?",
                        "Go to the sign-in page, choose Forgot Password, and follow the email instructions to create a new secure password.",
                        "getting-started"));
    }

    private String resolveSupportEmail() {
        String configured = appProperties.getSupportEmail();
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        return appProperties.getMailFrom();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String normalizeSpaces(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", " ");
    }

    private String normalizeSourcePage(String sourcePage, String fallback) {
        if (sourcePage == null || sourcePage.isBlank()) {
            return fallback;
        }
        return truncate(sourcePage.trim().toUpperCase(), 64);
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
