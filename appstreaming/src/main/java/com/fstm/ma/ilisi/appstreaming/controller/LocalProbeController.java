package com.fstm.ma.ilisi.appstreaming.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Neutralize noisy local probes sent by external tooling in dev mode.
 * These endpoints are not part of the appstreaming product API.
 */
@RestController
@Profile("dev")
@ConditionalOnProperty(name = "app.dev.silent-v2-probes", havingValue = "true", matchIfMissing = true)
@RequestMapping("/v2")
public class LocalProbeController {

    @PostMapping("/message-subscriptions/search")
    public ResponseEntity<Void> messageSubscriptionsSearchProbe() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/process-definitions/search")
    public ResponseEntity<Void> processDefinitionsSearchProbe() {
        return ResponseEntity.noContent().build();
    }
}

