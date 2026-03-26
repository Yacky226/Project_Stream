package com.fstm.ma.ilisi.appstreaming.config;

import com.fstm.ma.ilisi.appstreaming.config.AntMediaConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

/**
 * Health Indicator pour vérifier la connectivité avec Ant Media Server.
 * Accessible via /actuator/health
 */
@Component
@ConditionalOnProperty(name = "streaming.provider", havingValue = "antmedia", matchIfMissing = true)
public class AntMediaHealthIndicator implements HealthIndicator {

    private static final Logger log = LoggerFactory.getLogger(AntMediaHealthIndicator.class);
    
    private final CloseableHttpClient httpClient;
    private final AntMediaConfig antMediaConfig;

    public AntMediaHealthIndicator(CloseableHttpClient httpClient, AntMediaConfig antMediaConfig) {
        this.httpClient = httpClient;
        this.antMediaConfig = antMediaConfig;
    }

    @Override
    public Health health() {
        try {
            String healthUrl = antMediaConfig.getBaseUrl() + "/" + antMediaConfig.getAppName() + "/rest/v2/version";
            
            HttpGet request = new HttpGet(healthUrl);
            request.setHeader("Accept", "application/json");
            
            long startTime = System.currentTimeMillis();
            
            try (CloseableHttpResponse response = httpClient.execute(request)) {
                long responseTime = System.currentTimeMillis() - startTime;
                int statusCode = response.getStatusLine().getStatusCode();
                
                if (statusCode == 200) {
                    log.debug("Ant Media Server est accessible - Temps de réponse: {}ms", responseTime);
                    return Health.up()
                        .withDetail("url", antMediaConfig.getBaseUrl())
                        .withDetail("app", antMediaConfig.getAppName())
                        .withDetail("responseTime", responseTime + "ms")
                        .withDetail("status", "Connecté")
                        .build();
                } else {
                    log.warn("Ant Media Server a répondu avec le code: {}", statusCode);
                    return Health.down()
                        .withDetail("url", antMediaConfig.getBaseUrl())
                        .withDetail("statusCode", statusCode)
                        .withDetail("status", "Réponse inattendue")
                        .build();
                }
            }
            
        } catch (Exception e) {
            log.error("Impossible de contacter Ant Media Server", e);
            return Health.down()
                .withDetail("url", antMediaConfig.getBaseUrl())
                .withDetail("error", e.getMessage())
                .withDetail("status", "Inaccessible")
                .build();
        }
    }
}
