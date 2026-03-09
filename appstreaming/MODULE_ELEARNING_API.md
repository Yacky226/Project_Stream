# Module E-Learning Avancé - Documentation API

## Vue d'ensemble

Ce module implémente une structure hiérarchique complète pour les cours avec suivi de progression, système d'inscription et d'évaluation.

## Structure des Entités

### Hiérarchie des Cours

```
Cours
└── Section (Chapitre)
    └── Leçon (VIDEO, TEXTE, QUIZ)
        └── Ressource (PDF, LIEN, FICHIER)
```

### Suivi de Progression

```
Etudiant → Inscription → ProgressionLecon
    ↓           ↓
  Avis       Cours
```

## Endpoints API

### 1. Gestion des Sections

#### Créer une section

- **POST** `/api/sections`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`
- **Body**:

```json
{
  "titre": "Chapitre 1: Introduction",
  "description": "Description du chapitre",
  "ordre": 1,
  "coursId": 1
}
```

#### Récupérer les sections d'un cours

- **GET** `/api/sections/cours/{coursId}`
- **Autorisation**: Authentifié
- **Retour**: Liste des sections avec leurs leçons

#### Modifier une section

- **PUT** `/api/sections/{id}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

#### Supprimer une section

- **DELETE** `/api/sections/{id}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

---

### 2. Gestion des Leçons

#### Créer une leçon

- **POST** `/api/lecons`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`
- **Body**:

```json
{
  "titre": "Introduction aux concepts",
  "description": "Description de la leçon",
  "type": "VIDEO",
  "contenuUrl": "https://...",
  "dureeMinutes": 15,
  "ordre": 1,
  "sectionId": 1
}
```

**Types de leçons**: `VIDEO`, `TEXTE`, `QUIZ`

#### Récupérer les leçons d'une section

- **GET** `/api/lecons/section/{sectionId}`
- **Autorisation**: Authentifié

#### Récupérer toutes les leçons d'un cours

- **GET** `/api/lecons/cours/{coursId}`
- **Autorisation**: Authentifié

#### Modifier une leçon

- **PUT** `/api/lecons/{id}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

#### Supprimer une leçon

- **DELETE** `/api/lecons/{id}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

---

### 3. Gestion des Ressources

#### Ajouter une ressource

- **POST** `/api/ressources`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`
- **Body**:

```json
{
  "titre": "Support de cours",
  "type": "PDF",
  "url": "https://...",
  "tailleFichier": 1024000,
  "leconId": 1,
  "coursId": null
}
```

**Types de ressources**: `PDF`, `LIEN`, `FICHIER`

#### Récupérer les ressources d'une leçon

- **GET** `/api/ressources/lecon/{leconId}`
- **Autorisation**: Authentifié

#### Récupérer les ressources d'un cours

- **GET** `/api/ressources/cours/{coursId}`
- **Autorisation**: Authentifié

---

### 4. Gestion des Inscriptions

#### Inscrire un étudiant à un cours

- **POST** `/api/inscriptions?etudiantId={id}&coursId={id}`
- **Autorisation**: `ETUDIANT`
- **Retour**:

```json
{
  "id": 1,
  "etudiantId": 1,
  "coursId": 1,
  "dateInscription": "2025-11-30T10:00:00",
  "statut": "ACTIF",
  "progression": 0.0
}
```

**Statuts d'inscription**: `ACTIF`, `TERMINE`, `ABANDONNE`

#### Vérifier si un étudiant est inscrit

- **GET** `/api/inscriptions/check?etudiantId={id}&coursId={id}`
- **Autorisation**: Authentifié
- **Retour**: `true` ou `false`

#### Récupérer les inscriptions d'un étudiant

- **GET** `/api/inscriptions/etudiant/{etudiantId}`
- **Autorisation**: `ETUDIANT`, `ADMINISTRATEUR`

#### Récupérer les inscriptions d'un cours

- **GET** `/api/inscriptions/cours/{coursId}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

---

### 5. Suivi de Progression

#### Marquer une leçon comme terminée

- **POST** `/api/inscriptions/{inscriptionId}/lecon/{leconId}/complete`
- **Autorisation**: `ETUDIANT`
- **Action**:
  - Marque la leçon comme terminée
  - Recalcule automatiquement le pourcentage de progression global
  - Met à jour le statut de l'inscription à `TERMINE` si 100%

#### Marquer une leçon comme non terminée

- **DELETE** `/api/inscriptions/{inscriptionId}/lecon/{leconId}/complete`
- **Autorisation**: `ETUDIANT`

#### Récupérer la progression détaillée

- **GET** `/api/inscriptions/{inscriptionId}/progression`
- **Autorisation**: Authentifié
- **Retour**: Liste de toutes les leçons avec leur statut de complétion

#### Calculer la progression

- **GET** `/api/inscriptions/{inscriptionId}/progression/calcul`
- **Autorisation**: Authentifié
- **Retour**: Pourcentage de progression (0-100)

---

### 6. Système d'Avis (Reviews)

#### Créer un avis

- **POST** `/api/avis`
- **Autorisation**: `ETUDIANT`
- **Body**:

```json
{
  "etudiantId": 1,
  "coursId": 1,
  "note": 5,
  "commentaire": "Excellent cours!"
}
```

**Contraintes**:

- L'étudiant doit être inscrit au cours
- Note entre 1 et 5
- Un seul avis par étudiant par cours

#### Récupérer les avis d'un cours

- **GET** `/api/avis/cours/{coursId}`
- **Autorisation**: Public
- **Retour**: Liste des avis triés par date (récents en premier)

#### Obtenir la note moyenne d'un cours

- **GET** `/api/avis/cours/{coursId}/moyenne`
- **Autorisation**: Public
- **Retour**: Note moyenne (0.0 - 5.0)

#### Compter les avis d'un cours

- **GET** `/api/avis/cours/{coursId}/count`
- **Autorisation**: Public

#### Modifier un avis

- **PUT** `/api/avis/{id}`
- **Autorisation**: `ETUDIANT` (propriétaire)

#### Supprimer un avis

- **DELETE** `/api/avis/{id}`
- **Autorisation**: `ETUDIANT` (propriétaire), `ADMINISTRATEUR`

---

### 7. Détails Complets d'un Cours

#### Récupérer les détails complets

- **GET** `/api/cours/{id}/details?etudiantId={id}`
- **Autorisation**: Public
- **Retour**:

```json
{
  "id": 1,
  "titre": "Java Spring Boot",
  "description": "...",
  "categorie": "Programmation",
  "imageUrl": "https://...",
  "dureeEstimeeHeures": 40,
  "enseignantId": 1,
  "enseignantNom": "John Doe",
  "enseignantSpecialite": "Backend Development",
  "sections": [
    {
      "id": 1,
      "titre": "Introduction",
      "ordre": 1,
      "lecons": [
        {
          "id": 1,
          "titre": "Présentation",
          "type": "VIDEO",
          "dureeMinutes": 15,
          "ordre": 1,
          "ressources": [...]
        }
      ]
    }
  ],
  "nombreInscrits": 150,
  "notemoyenne": 4.5,
  "nombreAvis": 45,
  "isInscrit": true
}
```

---

## Logique Métier Importante

### Calcul Automatique de la Progression

Chaque fois qu'une leçon est marquée comme terminée ou non terminée, le système:

1. Compte le nombre total de leçons dans le cours
2. Compte le nombre de leçons terminées par l'étudiant
3. Calcule le pourcentage: `(leçons terminées / total leçons) × 100`
4. Met à jour automatiquement le champ `progression` de l'inscription
5. Si progression = 100%, change le statut à `TERMINE` et enregistre la date

### Sécurité des Avis

- Un étudiant ne peut poster un avis que s'il est inscrit au cours
- Un seul avis par étudiant par cours (contrainte unique en base de données)
- Seul le propriétaire peut modifier son avis
- Les administrateurs peuvent supprimer n'importe quel avis

### Relations en Cascade

- **Cours → Sections → Leçons → Ressources**: Suppression en cascade
- **Cours → Inscriptions → ProgressionLecon**: Suppression en cascade
- **Étudiant → Inscriptions**: Suppression en cascade

---

## Exemples d'Utilisation Frontend

### Afficher un cours avec sa structure complète

```typescript
// Récupérer les détails
const response = await fetch(
  `/api/cours/${coursId}/details?etudiantId=${userId}`
);
const coursDetails = await response.json();

// Afficher sections et leçons
coursDetails.sections.forEach((section) => {
  console.log(section.titre);
  section.lecons.forEach((lecon) => {
    console.log(`  - ${lecon.titre} (${lecon.dureeMinutes}min)`);
  });
});
```

### Suivre la progression d'un étudiant

```typescript
// Marquer une leçon comme vue
await fetch(`/api/inscriptions/${inscriptionId}/lecon/${leconId}/complete`, {
  method: "POST",
});

// Récupérer la progression mise à jour
const progression = await fetch(
  `/api/inscriptions/${inscriptionId}/progression/calcul`
);
const percentage = await progression.json(); // ex: 35.5
```

### Système d'avis

```typescript
// Créer un avis
await fetch("/api/avis", {
  method: "POST",
  body: JSON.stringify({
    etudiantId: userId,
    coursId: coursId,
    note: 4,
    commentaire: "Très bon cours!",
  }),
});

// Afficher la note moyenne
const average = await fetch(`/api/avis/cours/${coursId}/moyenne`).then((r) =>
  r.json()
);
console.log(`Note: ${average}/5`);
```

---

## Technologies Utilisées

- **Spring Boot 3** avec Spring Data JPA
- **MapStruct** pour le mapping Entité ↔ DTO
- **Spring Security** avec annotations `@PreAuthorize`
- **PostgreSQL** pour la persistance
- **Validation JSR-303** avec `@Valid`

---

## Prochaines Étapes

Ce module E-Learning est maintenant complet. Les prochaines implémentations seront:

1. **Module Interactivité Live** (WebSocket)

   - Chat en temps réel
   - Système Q&A avec votes
   - Gestion des mains levées

2. **Gestion Avancée du Streaming**

   - Récupération automatique des enregistrements VOD
   - Webhooks Ant Media Server
   - Vérification stricte des accès

3. **Système de Notifications**
   - Notifications automatiques (nouveaux cours, lives, etc.)
   - Support WebSocket pour les notifications temps réel
