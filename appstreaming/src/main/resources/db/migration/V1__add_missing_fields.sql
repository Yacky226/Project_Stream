-- Migration pour ajouter les champs manquants
-- Date: 1er décembre 2025
-- Description: Ajout des champs prenom, actif, date_creation dans utilisateur et archive dans cours

-- ========================================
-- 1. AJOUT DES COLONNES DANS UTILISATEUR
-- ========================================

-- Ajouter prenom (peut être NULL temporairement)
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS prenom VARCHAR(255);

-- Ajouter actif avec valeur par défaut
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT TRUE;

-- Ajouter date_creation
ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP;

-- ========================================
-- 2. MISE À JOUR DES DONNÉES EXISTANTES
-- ========================================

-- Mettre une valeur par défaut pour prenom si NULL
-- (vous devrez peut-être ajuster selon vos données)
UPDATE utilisateur SET prenom = 'À définir' WHERE prenom IS NULL;

-- S'assurer que tous les utilisateurs sont actifs par défaut
UPDATE utilisateur SET actif = TRUE WHERE actif IS NULL;

-- Définir date_creation à la date actuelle pour les enregistrements existants
UPDATE utilisateur SET date_creation = CURRENT_TIMESTAMP WHERE date_creation IS NULL;

-- ========================================
-- 3. RENDRE LES COLONNES NOT NULL
-- ========================================

ALTER TABLE utilisateur ALTER COLUMN prenom SET NOT NULL;
ALTER TABLE utilisateur ALTER COLUMN actif SET NOT NULL;
ALTER TABLE utilisateur ALTER COLUMN date_creation SET NOT NULL;

-- ========================================
-- 4. AJOUT DU CHAMP ARCHIVE DANS COURS
-- ========================================

-- Ajouter archive avec valeur par défaut
ALTER TABLE cours ADD COLUMN IF NOT EXISTS archive BOOLEAN DEFAULT FALSE;

-- Mettre à jour les enregistrements existants
UPDATE cours SET archive = FALSE WHERE archive IS NULL;

-- Rendre la colonne NOT NULL
ALTER TABLE cours ALTER COLUMN archive SET NOT NULL;

-- ========================================
-- 5. CRÉATION D'INDEX POUR PERFORMANCES
-- ========================================

-- Index sur actif pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_utilisateur_actif ON utilisateur(actif);

-- Index sur date_creation pour les statistiques
CREATE INDEX IF NOT EXISTS idx_utilisateur_date_creation ON utilisateur(date_creation);

-- Index sur archive pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_cours_archive ON cours(archive);

-- Index composite pour recherches combinées
CREATE INDEX IF NOT EXISTS idx_utilisateur_actif_role ON utilisateur(actif, role);

-- ========================================
-- VÉRIFICATION FINALE
-- ========================================

-- Afficher le nombre d'utilisateurs actifs
-- SELECT COUNT(*) as utilisateurs_actifs FROM utilisateur WHERE actif = TRUE;

-- Afficher le nombre de cours archivés vs actifs
-- SELECT archive, COUNT(*) as count FROM cours GROUP BY archive;
