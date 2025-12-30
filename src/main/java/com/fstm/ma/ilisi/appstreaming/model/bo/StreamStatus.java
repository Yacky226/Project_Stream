package com.fstm.ma.ilisi.appstreaming.model.bo;

public enum StreamStatus {
    CREATED,    // Session créée mais pas encore démarrée
    LIVE,       // Stream en cours
    ENDED,      // Stream terminé
    FAILED      // Échec technique
}