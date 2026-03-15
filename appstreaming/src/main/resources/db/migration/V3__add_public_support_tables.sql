-- ========================================
-- PUBLIC SUPPORT / CONTACT / NEWSLETTER
-- ========================================

CREATE TABLE IF NOT EXISTS support_contact_request (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    source_page VARCHAR(64) NOT NULL DEFAULT 'CONTACT_PAGE',
    ip_address VARCHAR(64),
    user_agent VARCHAR(512),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_contact_request_created_at
    ON support_contact_request(created_at);

CREATE INDEX IF NOT EXISTS idx_support_contact_request_status
    ON support_contact_request(status);

CREATE INDEX IF NOT EXISTS idx_support_contact_request_email
    ON support_contact_request(email);

CREATE TABLE IF NOT EXISTS newsletter_subscription (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    source_page VARCHAR(64) NOT NULL DEFAULT 'HELP_CENTER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_newsletter_subscription_email_lower
    ON newsletter_subscription(LOWER(email));

CREATE INDEX IF NOT EXISTS idx_newsletter_subscription_active
    ON newsletter_subscription(active);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscription_updated_at
    ON newsletter_subscription(updated_at);
