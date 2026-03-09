package com.fstm.ma.ilisi.appstreaming.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import com.fstm.ma.ilisi.appstreaming.model.bo.StreamStatus;
import com.fstm.ma.ilisi.appstreaming.model.dto.AntMediaWebhookDTO;
import com.fstm.ma.ilisi.appstreaming.repository.SessionStreamingRepository;
import com.fstm.ma.ilisi.appstreaming.service.StreamingService;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhook/antmedia")
public class AntMediaWebhookController {

    private final SessionStreamingRepository sessionRepository;
    private final StreamingService streamingService;

    public AntMediaWebhookController(
            SessionStreamingRepository sessionRepository,
            StreamingService streamingService) {
        this.sessionRepository = sessionRepository;
        this.streamingService = streamingService;
    }

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody AntMediaWebhookDTO webhook) {
        System.out.println("Webhook reçu : " + webhook);

        Optional<SessionStreaming> sessionOpt = sessionRepository.findByStreamKey(webhook.getStreamId());

        if (sessionOpt.isEmpty()) {
            System.out.println("Session introuvable pour streamId: " + webhook.getStreamId());
            return ResponseEntity.ok("Session not found");
        }

        SessionStreaming session = sessionOpt.get();

        // Traitement selon le type d'événement
        if (webhook.isStreamStarted()) {
            handleStreamStarted(session);
        } else if (webhook.isStreamEnded()) {
            handleStreamEnded(session);
        } else if (webhook.isVodReady()) {
            handleVodReady(session, webhook);
        }

        return ResponseEntity.ok("Webhook traité avec succès");
    }

    private void handleStreamStarted(SessionStreaming session) {
        if (session.getStatus() != StreamStatus.LIVE) {
            session.setStatus(StreamStatus.LIVE);
            session.setEstEnDirect(true);
            session.setDateHeure(LocalDateTime.now());
            sessionRepository.save(session);
            System.out.println("Stream démarré : " + session.getStreamKey());
        }
    }

    private void handleStreamEnded(SessionStreaming session) {
        if (session.getStatus() == StreamStatus.LIVE) {
            session.setStatus(StreamStatus.ENDED);
            session.setEstEnDirect(false);
            sessionRepository.save(session);
            System.out.println("Stream terminé : " + session.getStreamKey());

            // Tenter de récupérer le VOD immédiatement
            tryFetchVod(session);
        }
    }

    private void handleVodReady(SessionStreaming session, AntMediaWebhookDTO webhook) {
        if (session.getRecordingUrl() == null) {
            String vodUrl = streamingService.getVodUrl(session.getStreamKey());
            if (vodUrl != null) {
                session.setRecordingUrl(vodUrl);
                sessionRepository.save(session);
                System.out.println("VOD disponible : " + vodUrl);
            }
        }
    }

    private void tryFetchVod(SessionStreaming session) {
        // Tentative de récupération du VOD (peut ne pas être immédiatement disponible)
        try {
            String vodUrl = streamingService.getVodUrl(session.getStreamKey());
            if (vodUrl != null) {
                session.setRecordingUrl(vodUrl);
                sessionRepository.save(session);
            }
        } catch (Exception e) {
            System.err.println("VOD pas encore disponible : " + e.getMessage());
        }
    }
}
