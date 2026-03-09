package com.fstm.ma.ilisi.appstreaming.exception;

public class StreamOperationException extends RuntimeException {
    public StreamOperationException(String message) {
        super(message);
    }

    public StreamOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
