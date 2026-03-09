package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;

/**
 * Interface pour le service de streaming.
 * Facilite le mocking pour les tests.
 */
public interface StreamingServiceInterface {
    
    /**
     * Crée un nouveau stream dans Ant Media Server.
     */
    SessionStreaming createStream(SessionStreaming session);
    
    /**
     * Termine un stream existant sur Ant Media Server.
     */
    void endStream(String streamKey);
    
    /**
     * Récupère l'URL du VOD MP4 depuis Ant Media Server.
     */
    String getVodUrl(String streamId);
}
