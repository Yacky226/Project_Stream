-- ========================================
-- USER PREFERENCES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS utilisateur_preference (
    id BIGSERIAL PRIMARY KEY,
    utilisateur_id BIGINT NOT NULL UNIQUE,
    language VARCHAR(5) NOT NULL DEFAULT 'fr',
    timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris',
    theme VARCHAR(16) NOT NULL DEFAULT 'light',
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
    course_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
    autoplay BOOLEAN NOT NULL DEFAULT TRUE,
    playback_speed DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    subtitles BOOLEAN NOT NULL DEFAULT FALSE,
    quality VARCHAR(16) NOT NULL DEFAULT 'auto',
    download_quality VARCHAR(16) NOT NULL DEFAULT 'medium',
    show_online_status BOOLEAN NOT NULL DEFAULT TRUE,
    allow_profile_views BOOLEAN NOT NULL DEFAULT TRUE,
    allow_course_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_utilisateur_preference_utilisateur
        FOREIGN KEY (utilisateur_id)
        REFERENCES utilisateur(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_utilisateur_preference_user
    ON utilisateur_preference(utilisateur_id);
