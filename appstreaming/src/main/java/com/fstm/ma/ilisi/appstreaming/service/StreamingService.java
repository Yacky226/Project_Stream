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
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
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
     * Crée un nouveau stream dans Ant Media Server.
     * Si Ant Media est injoignable, la session est créée avec un streamKey uniquement.
     */
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "createStreamFallback")
    @Retry(name = SERVICE_NAME)
    public SessionStreaming createStream(SessionStreaming session) {
        String streamId = "stream_" + UUID.randomUUID();
        try {
            // Construction du corps JSON pour Ant Media
            JSONObject payload = new JSONObject()
                    .put("name", session.getCours().getTitre())
                    .put("streamId", streamId)
                    .put("type", "liveStream")
                    .put("mp4Enabled", session.isRecordingEnabled() ? 1 : 0); // Doit être un int

            // Construction de la requête POST
            HttpPost request = new HttpPost(antMediaConfig.getStreamCreateUrl());
            request.setEntity(new StringEntity(payload.toString(), StandardCharsets.UTF_8));
            request.setHeader("Content-Type", "application/json");

            log.info("Création du stream - URL: {}, Payload: {}", antMediaConfig.getStreamCreateUrl(), payload);

            // Exécution de la requête
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();

                // Lire le contenu de la réponse
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
                StringBuilder responseBody = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    responseBody.append(line);
                }

                log.info("Réponse Ant Media - Statut: {}, Body: {}", statusCode, responseBody);

                if (statusCode != 200) {
                    log.warn("Ant Media returned non-200 status: {} - {}", statusCode, responseBody);
                    // Fallback: save session with streamKey only
                    session.setStreamKey(streamId);
                    return session;
                }

                // Si tout va bien, configurer la session
                session.setStreamKey(streamId);
                session.setVideoUrl(antMediaConfig.getPlaybackUrl(streamId));
                return session;
            }

        } catch (Exception e) {
            log.warn("Ant Media unreachable, session created with streamKey only: {}", streamId, e);
            session.setStreamKey(streamId);
            // videoUrl left null — will be available when Ant Media becomes reachable and teacher publishes
            return session;
        }
    }

    /**
     * Fallback method for circuit breaker when Ant Media is consistently unreachable.
     */
    @SuppressWarnings("unused")
    private SessionStreaming createStreamFallback(SessionStreaming session, Throwable t) {
        String streamId = "stream_" + UUID.randomUUID();
        log.warn("Circuit breaker open for Ant Media. Creating session with streamKey only: {}", streamId, t);
        session.setStreamKey(streamId);
        return session;
    }

    /**
     * Termine un stream existant sur Ant Media Server.
     */
    @CircuitBreaker(name = SERVICE_NAME)
    @Retry(name = SERVICE_NAME)
    public void endStream(String streamKey) {
        try {
            log.info("Arrêt du stream: {}", streamKey);
            HttpPost request = new HttpPost(antMediaConfig.getStreamStopUrl(streamKey));
            httpClient.execute(request);
        } catch (Exception e) {
            log.error("Erreur lors de l'arrêt du stream: {}", streamKey, e);
        }
    }

    /**
     * Récupère l'URL du VOD MP4 depuis Ant Media Server après la fin d'un stream.
     * Retourne null si le VOD n'est pas encore disponible.
     */
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
                    log.warn("Impossible de récupérer le broadcast pour {}: statut {}", streamId, statusCode);
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

                // Vérifier si le MP4 est disponible
                int mp4Enabled = broadcast.optInt("mp4Enabled", 0);
                if (mp4Enabled == 1) {
                    String vodPath = broadcast.optString("vodPath", null);
                    return antMediaConfig.resolveVodUrl(vodPath, streamId);
                }

                return null;
            }

        } catch (Exception e) {
            log.error("Erreur lors de la récupération du VOD pour {}", streamId, e);
            return null;
        }
    }
}
