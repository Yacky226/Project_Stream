package com.fstm.ma.ilisi.appstreaming.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fstm.ma.ilisi.appstreaming.model.bo.Etudiant;
import com.fstm.ma.ilisi.appstreaming.model.bo.PasswordResetToken;
import com.fstm.ma.ilisi.appstreaming.model.bo.Role;
import com.fstm.ma.ilisi.appstreaming.repository.EtudiantRepository;
import com.fstm.ma.ilisi.appstreaming.repository.PasswordResetTokenRepository;
import com.fstm.ma.ilisi.appstreaming.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.mail.fail-on-error=false",
        "management.health.mail.enabled=false"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Tests d'integration AuthController")
class AuthControllerIntegrationTest {

    private static final String TEST_EMAIL = "auth-reset-it@example.com";
    private static final String UNKNOWN_EMAIL = "unknown-auth-reset-it@example.com";
    private static final String OLD_PASSWORD = "OldPass!123";
    private static final String NEW_PASSWORD = "NewPass!456";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        etudiantRepository.deleteAll();

        Etudiant etudiant = new Etudiant();
        etudiant.setNom("Integration");
        etudiant.setPrenom("Auth");
        etudiant.setEmail(TEST_EMAIL);
        etudiant.setPassword(passwordEncoder.encode(OLD_PASSWORD));
        etudiant.setRole(Role.ETUDIANT);
        etudiant.setNiveau("DEBUTANT");
        etudiantRepository.save(etudiant);
    }

    @Test
    @DisplayName("forgot-password puis reset-password puis login avec nouveau mot de passe")
    void passwordResetFlow_shouldResetPasswordAndAllowLoginWithNewPassword() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .header("X-Forwarded-For", "10.0.0.11")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", TEST_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("Email")));

        Etudiant user = etudiantRepository.findByEmail(TEST_EMAIL).orElseThrow();
        PasswordResetToken token = passwordResetTokenRepository.findByUtilisateurId(user.getId());
        assertThat(token).isNotNull();
        assertThat(token.getToken()).isNotBlank();

        mockMvc.perform(post("/api/auth/reset-password")
                        .header("X-Forwarded-For", "10.0.0.12")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token.getToken(),
                                "newPassword", NEW_PASSWORD
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("Mot de passe")));

        assertThat(passwordResetTokenRepository.findByToken(token.getToken())).isEmpty();

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "10.0.0.13")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", TEST_EMAIL,
                                "password", NEW_PASSWORD
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.role").value("ETUDIANT"));

        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "10.0.0.14")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "email", TEST_EMAIL,
                                "password", OLD_PASSWORD
                        ))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("forgot-password sur email inconnu retourne 200 sans creer de token")
    void forgotPasswordUnknownEmail_shouldReturnOkWithoutTokenCreation() throws Exception {
        long tokenCountBefore = passwordResetTokenRepository.count();

        mockMvc.perform(post("/api/auth/forgot-password")
                        .header("X-Forwarded-For", "10.0.0.21")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", UNKNOWN_EMAIL))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("Email")));

        assertThat(passwordResetTokenRepository.count()).isEqualTo(tokenCountBefore);
    }
}
