package com.fstm.ma.ilisi.appstreaming.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Short-circuits noisy local probes before reaching DispatcherServlet.
 * This keeps dev logs clean while preserving a 204 response for those endpoints.
 */
@Component
@Profile("dev")
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "app.dev.silent-v2-probes", havingValue = "true", matchIfMissing = true)
public class LocalProbeSilencingFilter extends OncePerRequestFilter {

    private static final Set<String> NOISY_LOCAL_PROBE_PATHS = Set.of(
            "/v2/message-subscriptions/search",
            "/v2/process-definitions/search");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (HttpMethod.POST.matches(request.getMethod()) && NOISY_LOCAL_PROBE_PATHS.contains(path)) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        filterChain.doFilter(request, response);
    }
}

