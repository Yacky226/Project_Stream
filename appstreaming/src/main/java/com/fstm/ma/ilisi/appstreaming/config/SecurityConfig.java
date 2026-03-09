package com.fstm.ma.ilisi.appstreaming.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import com.fstm.ma.ilisi.appstreaming.security.JwtAuthenticationFilter;
import com.fstm.ma.ilisi.appstreaming.security.WebhookSecurityFilter;
import com.fstm.ma.ilisi.appstreaming.security.RateLimitingFilter;
import com.fstm.ma.ilisi.appstreaming.security.RequestTracingFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final WebhookSecurityFilter webhookFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final RequestTracingFilter requestTracingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, 
                         WebhookSecurityFilter webhookFilter,
                         RateLimitingFilter rateLimitingFilter,
                         RequestTracingFilter requestTracingFilter) {
        this.jwtFilter = jwtFilter;
        this.webhookFilter = webhookFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.requestTracingFilter = requestTracingFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Désactiver CSRF
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configuration CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Gestion des sessions
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Autorisations
            .authorizeHttpRequests(auth -> auth
                // Public - endpoints d'authentification (sauf logout-all qui nécessite auth)
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
                    "/api/sessions/active",
                    "/api/sessions/{id}/url",
                    "/api/webhook/antmedia",  // Le webhook sera sécurisé par WebhookSecurityFilter
                    "/hls/**",
                    "/ws-stream/**"
                ).permitAll()
                
                // Enseignants
                .requestMatchers(
                    "/api/sessions/start",
                    "/api/sessions/{id}/stop"
                ).hasAuthority("ENSEIGNANT")
                
                // Admin
                .requestMatchers("/api/admin/**").hasAuthority("ADMINISTRATEUR")
                
                // Étudiants
                .requestMatchers("/api/etudiant/**").hasAuthority("ETUDIANT")
                
                // Authentifié
                .anyRequest().authenticated()
            )
            
            // Filtre de tracing (premier dans la chaîne)
            .addFilterBefore(requestTracingFilter, org.springframework.security.web.context.SecurityContextHolderFilter.class)
            
            // Filtre de rate limiting (après tracing, avant auth)
            .addFilterAfter(rateLimitingFilter, RequestTracingFilter.class)
            
            // Filtre JWT
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Filtre de sécurité webhook (avant JWT car ne nécessite pas d'auth JWT)
            .addFilterBefore(webhookFilter, JwtAuthenticationFilter.class)
            
            // Headers de sécurité
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("media-src 'self' http://localhost:5080;")
                )
                .frameOptions(frame -> frame.sameOrigin())
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://domaine.com"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "X-CSRF-TOKEN"
        ));
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
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring()
            .requestMatchers(
                "/api/stream/**",
                "/hls/**",
                "/error"
            );
    }
}