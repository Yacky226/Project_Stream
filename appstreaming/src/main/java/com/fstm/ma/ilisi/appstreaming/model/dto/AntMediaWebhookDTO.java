package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AntMediaWebhookDTO {
    
    private String streamId;
    private String action; // "liveStreamStarted", "liveStreamEnded", "vodReady"
    private Long timestamp;
    private String category; // "broadcast", "vod"
    private String vodName;
    private String vodPath;
    
    // Méthodes utilitaires
    public boolean isStreamStarted() {
        return "liveStreamStarted".equals(action);
    }
    
    public boolean isStreamEnded() {
        return "liveStreamEnded".equals(action);
    }
    
    public boolean isVodReady() {
        return "vodReady".equals(action);
    }
}
