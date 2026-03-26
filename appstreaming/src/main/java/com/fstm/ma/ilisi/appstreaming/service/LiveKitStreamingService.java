package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@ConditionalOnProperty(name = "streaming.provider", havingValue = "livekit")
public class LiveKitStreamingService implements StreamingServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(LiveKitStreamingService.class);
    private static final long TOKEN_TTL_SECONDS = 3600L;

    private final String wsUrl;
    private final String apiKey;
    private final String apiSecret;
    private final String meetBaseUrl;

    public LiveKitStreamingService(
            @Value("${livekit.ws-url:}") String wsUrl,
            @Value("${livekit.api-key:}") String apiKey,
            @Value("${livekit.api-secret:}") String apiSecret,
            @Value("${livekit.meet-base-url:https://meet.livekit.io}") String meetBaseUrl) {
        this.wsUrl = wsUrl != null ? wsUrl.trim() : "";
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.apiSecret = apiSecret != null ? apiSecret.trim() : "";
        this.meetBaseUrl = normalizeBaseUrl(meetBaseUrl);
    }

    @Override
    public SessionStreaming createStream(SessionStreaming session) {
        if (!StringUtils.hasText(session.getStreamKey())) {
            session.setStreamKey("lk_room_" + UUID.randomUUID().toString().replace("-", ""));
        }

        session.setVideoUrl(buildPlaybackUrl(session));
        session.setBroadcastType("LIVEKIT");

        return session;
    }

    @Override
    public void endStream(String streamKey) {
        // LiveKit rooms close naturally when no participant remains.
        log.info("LiveKit endStream called for room {} (no-op).", streamKey);
    }

    @Override
    public String getVodUrl(String streamId) {
        // Recording/egress wiring can be added later depending on deployment choice.
        return null;
    }

    @Override
    public String buildPlaybackUrl(SessionStreaming session) {
        if (session == null || !StringUtils.hasText(session.getStreamKey())) {
            return null;
        }
        return "livekit://room/" + session.getStreamKey();
    }

    @Override
    public String resolveAccessUrl(SessionStreaming session, String participantIdentity, boolean canPublish) {
        validateConfiguration();

        String roomName = session != null ? session.getStreamKey() : null;
        if (!StringUtils.hasText(roomName)) {
            throw new IllegalStateException("LiveKit room name is missing for this session.");
        }

        String identity = sanitizeIdentity(participantIdentity);
        String token = buildAccessToken(roomName, identity, canPublish);

        return meetBaseUrl
                + "/custom?liveKitUrl="
                + urlEncode(wsUrl)
                + "&token="
                + urlEncode(token);
    }

    private String buildAccessToken(String roomName, String identity, boolean canPublish) {
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(TOKEN_TTL_SECONDS);

        Map<String, Object> videoGrant = Map.of(
                "roomJoin", true,
                "room", roomName,
                "canPublish", canPublish,
                "canPublishData", true,
                "canSubscribe", true);

        SecretKey key;
        try {
            key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException(
                    "LIVEKIT_API_SECRET is invalid for HMAC signing. Provide a strong secret.", ex);
        }

        return Jwts.builder()
                .issuer(apiKey)
                .subject(identity)
                .claim("name", identity)
                .claim("video", videoGrant)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(key)
                .compact();
    }

    private void validateConfiguration() {
        if (!StringUtils.hasText(wsUrl)) {
            throw new IllegalStateException("LiveKit ws-url is not configured.");
        }
        if (!StringUtils.hasText(apiKey)) {
            throw new IllegalStateException("LiveKit api-key is not configured.");
        }
        if (!StringUtils.hasText(apiSecret)) {
            throw new IllegalStateException("LiveKit api-secret is not configured.");
        }
    }

    private String sanitizeIdentity(String rawIdentity) {
        if (!StringUtils.hasText(rawIdentity)) {
            return "user_" + UUID.randomUUID();
        }

        String normalized = rawIdentity
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9._@-]", "_");
        if (!StringUtils.hasText(normalized)) {
            return "user_" + UUID.randomUUID();
        }
        return normalized;
    }

    private String normalizeBaseUrl(String value) {
        String fallback = "https://meet.livekit.io";
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return StringUtils.hasText(trimmed) ? trimmed : fallback;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
