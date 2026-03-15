-- ========================================
-- ADMIN SUPPORT WORKFLOW ENRICHMENT
-- ========================================

ALTER TABLE support_contact_request
    ADD COLUMN IF NOT EXISTS assigned_admin_id BIGINT,
    ADD COLUMN IF NOT EXISTS internal_note TEXT,
    ADD COLUMN IF NOT EXISTS last_admin_reply TEXT,
    ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS responded_by_admin_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_support_contact_assigned_admin'
          AND table_name = 'support_contact_request'
    ) THEN
        ALTER TABLE support_contact_request
            ADD CONSTRAINT fk_support_contact_assigned_admin
            FOREIGN KEY (assigned_admin_id)
            REFERENCES utilisateur(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_support_contact_responded_by_admin'
          AND table_name = 'support_contact_request'
    ) THEN
        ALTER TABLE support_contact_request
            ADD CONSTRAINT fk_support_contact_responded_by_admin
            FOREIGN KEY (responded_by_admin_id)
            REFERENCES utilisateur(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_support_contact_request_assigned_admin
    ON support_contact_request(assigned_admin_id);

CREATE INDEX IF NOT EXISTS idx_support_contact_request_replied_at
    ON support_contact_request(replied_at);
