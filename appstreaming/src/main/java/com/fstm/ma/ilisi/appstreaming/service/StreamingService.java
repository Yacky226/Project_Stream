package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.config.AntMediaConfig;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "streaming.provider", havingValue = "antmedia", matchIfMissing = true)
public class StreamingService implements StreamingServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(StreamingService.class);
    private static final String SERVICE_NAME = "antMediaService";

    private final CloseableHttpClient httpClient;
    private final AntMediaConfig antMediaConfig;

    public StreamingService(CloseableHttpClient httpClient, AntMediaConfig antMediaConfig) {
        this.httpClient = httpClient;
        this.antMediaConfig = antMediaConfig;
    }

    /**
     * Cree un nouveau stream dans Ant Media Server.
     * Si Ant Media est injoignable, la session est creee avec un streamKey uniquement.
     */
    @Override
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "createStreamFallback")
    @Retry(name = SERVICE_NAME)
    public SessionStreaming createStream(SessionStreaming session) {
        String streamId = "stream_" + UUID.randomUUID();
        try {
            JSONObject payload = new JSONObject()
                    .put("name", session.getCours().getTitre())
                    .put("streamId", streamId)
                    .put("type", "liveStream")
                    .put("mp4Enabled", session.isRecordingEnabled() ? 1 : 0);

            HttpPost request = new HttpPost(antMediaConfig.getStreamCreateUrl());
            request.setEntity(new StringEntity(payload.toString(), StandardCharsets.UTF_8));
            request.setHeader("Content-Type", "application/json");

            log.info("Creation du stream - URL: {}, Payload: {}", antMediaConfig.getStreamCreateUrl(), payload);

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
                StringBuilder responseBody = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    responseBody.append(line);
                }

                log.info("Reponse Ant Media - Statut: {}, Body: {}", statusCode, responseBody);

                if (statusCode != 200) {
                    log.warn("Ant Media returned non-200 status: {} - {}", statusCode, responseBody);
                    session.setStreamKey(streamId);
                    session.setVideoUrl(buildPlaybackUrl(session));
                    return session;
                }

                session.setStreamKey(streamId);
                session.setVideoUrl(buildPlaybackUrl(session));
                return session;
            }

        } catch (Exception e) {
            log.warn("Ant Media unreachable, session created with streamKey only: {}", streamId, e);
            session.setStreamKey(streamId);
            session.setVideoUrl(buildPlaybackUrl(session));
            return session;
        }
    }

    @SuppressWarnings("unused")
    private SessionStreaming createStreamFallback(SessionStreaming session, Throwable t) {
        String streamId = "stream_" + UUID.randomUUID();
        log.warn("Circuit breaker open for Ant Media. Creating session with streamKey only: {}", streamId, t);
        session.setStreamKey(streamId);
        session.setVideoUrl(buildPlaybackUrl(session));
        return session;
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME)
    @Retry(name = SERVICE_NAME)
    public void endStream(String streamKey) {
        try {
            log.info("Arret du stream: {}", streamKey);
            HttpPost request = new HttpPost(antMediaConfig.getStreamStopUrl(streamKey));
            httpClient.execute(request);
        } catch (Exception e) {
            log.error("Erreur lors de l'arret du stream: {}", streamKey, e);
        }
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME)
    @Retry(name = SERVICE_NAME)
    public String getVodUrl(String streamId) {
        try {
            org.apache.http.client.methods.HttpGet request =
                    new org.apache.http.client.methods.HttpGet(antMediaConfig.getBroadcastDetailsUrl(streamId));
            request.setHeader("Accept", "application/json");

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode != 200) {
                    log.warn("Impossible de recuperer le broadcast pour {}: statut {}", streamId, statusCode);
                    return null;
                }

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
                StringBuilder responseBody = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    responseBody.append(line);
                }

                JSONObject broadcast = new JSONObject(responseBody.toString());
                int mp4Enabled = broadcast.optInt("mp4Enabled", 0);
                if (mp4Enabled == 1) {
                    String vodPath = broadcast.optString("vodPath", null);
                    return antMediaConfig.resolveVodUrl(vodPath, streamId);
                }

                return null;
            }

        } catch (Exception e) {
            log.error("Erreur lors de la recuperation du VOD pour {}", streamId, e);
            return null;
        }
    }

    @Override
    public String buildPlaybackUrl(SessionStreaming session) {
        if (session.getStreamKey() == null || session.getStreamKey().isBlank()) {
            return null;
        }
        return antMediaConfig.getPlaybackUrl(session.getStreamKey());
    }

    @Override
    public String resolveAccessUrl(SessionStreaming session, String participantIdentity, boolean canPublish) {
        if (session.getStreamKey() == null || session.getStreamKey().isBlank()) {
            return null;
        }
        return antMediaConfig.getPlayerUrl(session.getStreamKey());
    }
}
