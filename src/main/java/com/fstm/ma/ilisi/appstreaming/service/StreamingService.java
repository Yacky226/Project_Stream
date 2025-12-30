package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.config.AntMediaConfig;
import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
public class StreamingService {

    private final CloseableHttpClient httpClient;
    private final AntMediaConfig antMediaConfig;

    public StreamingService(CloseableHttpClient httpClient, AntMediaConfig antMediaConfig) {
        this.httpClient = httpClient;
        this.antMediaConfig = antMediaConfig;
    }

    /**
     * Crée un nouveau stream dans Ant Media Server.
     */
    public SessionStreaming createStream(SessionStreaming session) {
        try {
            String streamId = "stream_" + UUID.randomUUID();

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

            System.out.println("POST URL : " + antMediaConfig.getStreamCreateUrl());
            System.out.println("Payload : " + payload);

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

                System.out.println("Statut HTTP : " + statusCode);
                System.out.println("Réponse Ant Media : " + responseBody);

                if (statusCode != 200) {
                    throw new RuntimeException("Échec de la création du stream : " + statusCode + " - " + responseBody);
                }

                // Si tout va bien, configurer la session
                session.setStreamKey(streamId);
                session.setVideoUrl(antMediaConfig.getPlaybackUrl(streamId));
                return session;
            }

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du stream", e);
        }
    }

    /**
     * Termine un stream existant sur Ant Media Server.
     */
    public void endStream(String streamKey) {
        try {
            HttpPost request = new HttpPost(antMediaConfig.getStreamStopUrl(streamKey));
            httpClient.execute(request);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'arrêt du stream", e);
        }
    }

    /**
     * Récupère l'URL du VOD MP4 depuis Ant Media Server après la fin d'un stream.
     * Retourne null si le VOD n'est pas encore disponible.
     */
    public String getVodUrl(String streamId) {
        try {
            org.apache.http.client.methods.HttpGet request = 
                    new org.apache.http.client.methods.HttpGet(antMediaConfig.getBroadcastDetailsUrl(streamId));
            request.setHeader("Accept", "application/json");

            try (CloseableHttpResponse response = httpClient.execute(request)) {
                int statusCode = response.getStatusLine().getStatusCode();

                if (statusCode != 200) {
                    System.out.println("Impossible de récupérer le broadcast : " + statusCode);
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
                if (broadcast.has("mp4Enabled") && broadcast.getInt("mp4Enabled") == 1) {
                    // Construction de l'URL du VOD
                    String vodPath = broadcast.optString("vodPath", null);
                    if (vodPath != null && !vodPath.isEmpty()) {
                        return antMediaConfig.getPlaybackUrl(streamId).replace(".m3u8", ".mp4");
                    }
                }

                return null;
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération du VOD : " + e.getMessage());
            return null;
        }
    }
}
