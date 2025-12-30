package com.fstm.ma.ilisi.appstreaming.config;

import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AntMediaConfig {

    @Value("${antmedia.server.base-url}") 
    private String baseUrl;

    @Value("${antmedia.server.app}")
    private String appName;

    public String getStreamCreateUrl() {
        return baseUrl + "/" + appName + "/rest/v2/broadcasts/create";
    }

    public String getStreamStopUrl(String streamId) {
        return baseUrl + "/" + appName + "/rest/v2/broadcasts/" + streamId + "/stop";
    }

    public String getPlaybackUrl(String streamId) {
        // Pour lecture HLS (HTTP Live Streaming) — lecture côté <video>
        return baseUrl.replace(":5080", ":5443") + "/" + appName + "/streams/" + streamId + ".m3u8";
    }

    public String getWsUrl() {
        // Pour publier/recevoir avec WebRTC JS
        return "wss://" + baseUrl.replace("http://", "").replace(":5080", ":5443") + "/" + appName + "/websocket";
    }

    public String getBroadcastDetailsUrl(String streamId) {
        // Pour récupérer les détails d'un broadcast (incluant le VOD)
        return baseUrl + "/" + appName + "/rest/v2/broadcasts/" + streamId;
    }

    @Bean
    public CloseableHttpClient httpClient() {
        return HttpClients.createDefault();
    }
}
