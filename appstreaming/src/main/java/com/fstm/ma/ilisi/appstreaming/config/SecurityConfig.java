package com.fstm.ma.ilisi.appstreaming.config;

import com.fstm.ma.ilisi.appstreaming.security.JwtAuthenticationFilter;
import com.fstm.ma.ilisi.appstreaming.security.RateLimitingFilter;
import com.fstm.ma.ilisi.appstreaming.security.RequestTracingFilter;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final RequestTracingFilter requestTracingFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtFilter,
            RateLimitingFilter rateLimitingFilter,
            RequestTracingFilter requestTracingFilter) {
        this.jwtFilter = jwtFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.requestTracingFilter = requestTracingFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public auth and infra endpoints
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register-etudiant",
                                "/api/auth/register-enseignant",
                                "/api/auth/register-admin",
                                "/api/auth/refresh-token",
                                "/api/auth/logout",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/Uploads/photos/**",
                                "/v2/message-subscriptions/search",
                                "/v2/process-definitions/search",
                                "/ws-stream/**")
                        .permitAll()

                        // Public homepage and support data
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/cours",
                                "/api/cours/**",
                                "/api/avis/cours/**",
                                "/api/sessions/actives",
                                "/api/sessions/*/url",
                                "/api/public/support/help-center")
                        .permitAll()
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/public/support/contact",
                                "/api/public/support/newsletter")
                        .permitAll()

                        // Teacher-only
                        .requestMatchers("/api/sessions/*/start", "/api/sessions/*/stop")
                        .hasAuthority("ENSEIGNANT")

                        // Admin-only
                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ADMINISTRATEUR")

                        // Student-only
                        .requestMatchers("/api/etudiant/**")
                        .hasAuthority("ETUDIANT")

                        // Everything else requires auth
                        .anyRequest()
                        .authenticated())
                .addFilterBefore(
                        requestTracingFilter,
                        org.springframework.security.web.context.SecurityContextHolderFilter.class)
                .addFilterAfter(rateLimitingFilter, RequestTracingFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> headers
                        .contentSecurityPolicy(
                                csp -> csp.policyDirectives(
                                        "default-src 'self'; media-src 'self' https: blob:; "
                                                + "connect-src 'self' https: wss: ws:; "
                                                + "frame-src 'self' https://meet.livekit.io;"))
                        .frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://domaine.com"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "X-CSRF-TOKEN"));
        config.setExposedHeaders(Arrays.asList("Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/api/stream/**", "/error");
    }
}
