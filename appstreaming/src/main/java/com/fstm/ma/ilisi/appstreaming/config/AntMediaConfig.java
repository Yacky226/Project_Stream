package com.fstm.ma.ilisi.appstreaming.config;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@Configuration
@ConditionalOnProperty(name = "streaming.provider", havingValue = "antmedia", matchIfMissing = true)
public class AntMediaConfig {

    @Value("${antmedia.server.base-url}")
    private String baseUrl;

    @Value("${antmedia.server.app}")
    private String appName;

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getAppName() {
        return appName;
    }

    private String normalizeBaseUrl() {
        return baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    private URI baseUri() {
        return URI.create(normalizeBaseUrl());
    }

    public String getStreamCreateUrl() {
        return normalizeBaseUrl() + "/" + appName + "/rest/v2/broadcasts/create";
    }

    public String getStreamStopUrl(String streamId) {
        return normalizeBaseUrl() + "/" + appName + "/rest/v2/broadcasts/" + streamId + "/stop";
    }

    public String getPlaybackUrl(String streamId) {
        return normalizeBaseUrl() + "/" + appName + "/streams/" + streamId + ".m3u8";
    }

    public String getPlayerUrl(String streamId) {
        return normalizeBaseUrl() + "/" + appName + "/play.html?id=" + streamId + "&playOrder=webrtc,hls";
    }

    public String getWsUrl() {
        URI uri = baseUri();
        String scheme = "https".equalsIgnoreCase(uri.getScheme()) ? "wss" : "ws";
        String host = uri.getHost();
        int port = uri.getPort();
        String authority = port > 0 ? host + ":" + port : host;
        return scheme + "://" + authority + "/" + appName + "/websocket";
    }

    public String getBroadcastDetailsUrl(String streamId) {
        return normalizeBaseUrl() + "/" + appName + "/rest/v2/broadcasts/" + streamId;
    }

    public String resolveVodUrl(String vodPath, String streamId) {
        if (vodPath == null || vodPath.isBlank()) {
            return normalizeBaseUrl() + "/" + appName + "/streams/" + streamId + ".mp4";
        }

        String normalizedPath = vodPath.trim();
        if (normalizedPath.startsWith("http://") || normalizedPath.startsWith("https://")) {
            return normalizedPath;
        }

        normalizedPath = normalizedPath.replaceFirst("^/+", "");
        if (normalizedPath.startsWith(appName + "/")) {
            return normalizeBaseUrl() + "/" + normalizedPath;
        }

        if (normalizedPath.startsWith("streams/")) {
            return normalizeBaseUrl() + "/" + appName + "/" + normalizedPath;
        }

        return normalizeBaseUrl() + "/" + appName + "/streams/" + normalizedPath;
    }

    @Bean
    public CloseableHttpClient httpClient() {
        return HttpClients.createDefault();
    }
}
