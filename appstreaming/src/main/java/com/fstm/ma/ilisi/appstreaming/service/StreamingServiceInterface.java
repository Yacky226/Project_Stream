package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.bo.SessionStreaming;

/**
 * Interface provider-agnostic pour la gestion du streaming.
 */
public interface StreamingServiceInterface {

    /**
     * Cree une session stream cote provider (ou prepare ses metadonnees locales).
     */
    SessionStreaming createStream(SessionStreaming session);

    /**
     * Termine un stream existant cote provider.
     */
    void endStream(String streamKey);

    /**
     * Recupere l'URL VOD finale si disponible.
     */
    String getVodUrl(String streamId);

    /**
     * Construit une URL de lecture statique stockee dans la session.
     */
    String buildPlaybackUrl(SessionStreaming session);

    /**
     * Construit l'URL d'acces finale pour un utilisateur donne.
     */
    String resolveAccessUrl(SessionStreaming session, String participantIdentity, boolean canPublish);
}
