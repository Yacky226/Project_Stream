package com.fstm.ma.ilisi.appstreaming.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsqu'un token (refresh token) est invalide ou expiré.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class TokenRefreshException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public TokenRefreshException(String token, String message) {
        super(String.format("Échec du refresh token [%s]: %s", token, message));
    }

    public TokenRefreshException(String message) {
        super(message);
    }
}
