# MODULE ADMINISTRATION - GESTION COMPLÈTE DE LA PLATEFORME

## Vue d'ensemble

Ce module fournit aux administrateurs un contrôle total sur la plateforme LMS avec :

- 📊 **Dashboard** avec statistiques en temps réel
- 👥 **Gestion des utilisateurs** (activation/désactivation, modification, suppression)
- 📚 **Supervision des cours** (archivage, validation, suppression)
- 🎓 **Gestion des inscriptions** (supervision, annulation)
- 📈 **Analytics** avancés (top cours, top enseignants, moyennes)

---

## 📊 DASHBOARD - Statistiques Globales

### Endpoint : `GET /api/admin/dashboard`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Retourne un tableau de bord complet avec toutes les métriques de la plateforme.

**Réponse** :

```json
{
  "totalUtilisateurs": 250,
  "totalEtudiants": 200,
  "totalEnseignants": 45,
  "totalAdministrateurs": 5,

  "totalCours": 50,
  "coursActifs": 42,
  "coursArchives": 8,

  "totalInscriptions": 800,
  "inscriptionsActives": 650,

  "totalSections": 250,
  "totalLecons": 1200,

  "totalSessions": 120,
  "sessionsLive": 3,
  "sessionsTerminees": 80,

  "totalMessages": 5000,
  "totalQuestions": 450,
  "totalHandRaises": 230,

  "nouvellesInscriptionsMois": 85,
  "nouveauxUtilisateursMois": 42,
  "sessionsLiveMois": 15,

  "moyenneNoteCours": 4.3,
  "tauxCompletionMoyen": 67.5,

  "coursLesPlusPopulaires": {
    "data": [
      ["Spring Boot Avancé", 150],
      ["React JS", 120],
      ["Docker & Kubernetes", 95]
    ]
  },
  "enseignantsLesPlusActifs": {
    "data": [
      ["Dupont", "Jean", 12],
      ["Martin", "Marie", 8]
    ]
  }
}
```

**Indicateurs calculés** :

- **Utilisateurs** : Comptage par rôle (ETUDIANT, ENSEIGNANT, ADMINISTRATEUR)
- **Cours** : Actifs vs archivés
- **Inscriptions** : Total et par statut (ACTIF, TERMINE, ABANDONNE)
- **Structure** : Nombre de sections et leçons
- **Streaming** : Sessions totales, live actuellement, terminées avec VOD
- **Interactivité** : Messages chat, questions Q&A, mains levées
- **Tendances** : Nouvelles inscriptions/utilisateurs/sessions du dernier mois
- **Qualité** : Moyenne des notes (1-5 étoiles), taux de complétion moyen
- **Popularité** : Top 5 cours par inscriptions, Top 5 enseignants par nombre de cours

---

## 👥 GESTION DES UTILISATEURS

### 1. Lister tous les utilisateurs

**Endpoint** : `GET /api/admin/users`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Retourne la liste complète des utilisateurs (étudiants, enseignants, administrateurs) avec leurs statistiques.

**Réponse** :

```json
[
  {
    "id": 15,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "role": "ENSEIGNANT",
    "actif": true,
    "dateCreation": "2024-10-15T10:30:00",
    "nombreCours": 5,
    "nombreSessions": 12,
    "specialite": "Développement Web",
    "photoProfil": "https://..."
  },
  {
    "id": 25,
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "sophie.martin@example.com",
    "role": "ETUDIANT",
    "actif": true,
    "dateCreation": "2024-11-01T14:20:00",
    "nombreCours": 8,
    "nombreInscriptions": 8,
    "niveau": "L3",
    "photoProfil": "https://..."
  }
]
```

**Champs spécifiques par rôle** :

- **ETUDIANT** : `niveau`, `nombreInscriptions`, `nombreCours` (cours inscrits)
- **ENSEIGNANT** : `specialite`, `nombreCours` (cours créés), `nombreSessions`
- **ADMINISTRATEUR** : Aucun champ spécifique

---

### 2. Obtenir un utilisateur par ID

**Endpoint** : `GET /api/admin/users/{id}`

**Rôle requis** : `ADMINISTRATEUR`

**Paramètres** :

- `id` : ID de l'utilisateur

**Réponse** : Objet `UserManagementDTO` avec toutes les informations

---

### 3. Modifier un utilisateur

**Endpoint** : `PUT /api/admin/users/{id}`

**Rôle requis** : `ADMINISTRATEUR`

**Body** :

```json
{
  "nom": "Dupont",
  "prenom": "Jean-Michel",
  "email": "jm.dupont@example.com",
  "specialite": "Data Science", // Pour enseignant
  "niveau": "M1" // Pour étudiant
}
```

**Réponse** : Utilisateur mis à jour

---

### 4. Activer/Désactiver un utilisateur

**Endpoint** : `PATCH /api/admin/users/{id}/toggle-status?actif=true`

**Rôle requis** : `ADMINISTRATEUR`

**Paramètres** :

- `id` : ID de l'utilisateur
- `actif` : `true` (activer) ou `false` (désactiver)

**Réponse** :

```json
"Utilisateur activé"
```

**Effet** : Un utilisateur désactivé ne peut plus se connecter à la plateforme.

---

### 5. Supprimer un utilisateur

**Endpoint** : `DELETE /api/admin/users/{id}`

**Rôle requis** : `ADMINISTRATEUR`

**Paramètres** : `id` : ID de l'utilisateur

**Réponse** : `200 OK`

**⚠️ Attention** : Suppression définitive de l'utilisateur et de toutes ses données associées.

---

## 📚 GESTION DES COURS

### 1. Lister tous les cours (vue admin)

**Endpoint** : `GET /api/admin/courses`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Retourne tous les cours avec statistiques détaillées.

**Réponse** :

```json
[
  {
    "id": 5,
    "titre": "Spring Boot Avancé",
    "description": "Cours complet sur Spring Boot...",
    "archive": false,
    "dateCreation": "2024-09-10T09:00:00",
    "enseignantId": 10,
    "enseignantNom": "Dupont",
    "enseignantPrenom": "Jean",
    "nombreInscriptions": 150,
    "nombreSections": 8,
    "nombreLecons": 45,
    "nombreSessions": 12,
    "moyenneNotes": 4.5,
    "nombreAvis": 80,
    "vuesTotal": null,
    "tauxCompletion": 65.3
  }
]
```

**Métriques incluses** :

- **Popularité** : Nombre d'inscriptions
- **Contenu** : Sections, leçons, sessions de streaming
- **Qualité** : Moyenne des notes, nombre d'avis
- **Performance** : Taux de complétion (% d'étudiants ayant terminé le cours)

---

### 2. Détails d'un cours (vue admin)

**Endpoint** : `GET /api/admin/courses/{id}`

**Rôle requis** : `ADMINISTRATEUR`

**Réponse** : Objet `CourseManagementDTO` avec toutes les statistiques

---

### 3. Archiver un cours

**Endpoint** : `PATCH /api/admin/courses/{id}/archive`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Marque un cours comme archivé. Le cours n'est plus visible pour les nouveaux étudiants mais reste accessible aux inscrits actuels.

**Réponse** :

```json
"Cours archivé"
```

---

### 4. Désarchiver un cours

**Endpoint** : `PATCH /api/admin/courses/{id}/unarchive`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Réactive un cours archivé.

**Réponse** :

```json
"Cours désarchivé"
```

---

### 5. Supprimer un cours

**Endpoint** : `DELETE /api/admin/courses/{id}`

**Rôle requis** : `ADMINISTRATEUR`

**Réponse** : `200 OK`

**⚠️ Attention** : Suppression définitive du cours et de toutes ses données (sections, leçons, inscriptions, avis, sessions).

---

## 🎓 GESTION DES INSCRIPTIONS

### 1. Lister toutes les inscriptions

**Endpoint** : `GET /api/admin/inscriptions`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Retourne toutes les inscriptions de la plateforme.

**Réponse** :

```json
[
  {
    "id": 100,
    "etudiantId": 25,
    "etudiantNom": "Martin",
    "etudiantPrenom": "Sophie",
    "etudiantEmail": "sophie.martin@example.com",
    "coursId": 5,
    "coursTitre": "Spring Boot Avancé",
    "enseignantNom": "Dupont Jean",
    "statut": "ACTIF",
    "progression": 45.5,
    "dateInscription": "2024-11-15T10:00:00",
    "dateDerniereActivite": "2024-12-01T14:30:00",
    "leconsCompletees": 20,
    "leconsTotal": 45
  }
]
```

**Statuts possibles** :

- `ACTIF` : Inscription en cours
- `TERMINE` : Cours complété (progression 100%)
- `ABANDONNE` : Inscription annulée

---

### 2. Inscriptions d'un cours

**Endpoint** : `GET /api/admin/inscriptions/course/{coursId}`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Liste toutes les inscriptions pour un cours spécifique.

---

### 3. Inscriptions d'un étudiant

**Endpoint** : `GET /api/admin/inscriptions/student/{etudiantId}`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Liste toutes les inscriptions d'un étudiant.

---

### 4. Annuler une inscription

**Endpoint** : `PATCH /api/admin/inscriptions/{id}/cancel`

**Rôle requis** : `ADMINISTRATEUR`

**Description** : Annule une inscription (passe le statut à `ABANDONNE`).

**Réponse** :

```json
"Inscription annulée"
```

**Effet** : L'étudiant ne peut plus accéder au contenu du cours ni aux sessions de streaming associées.

---

## 📈 STATISTIQUES AVANCÉES

### Top Cours par Inscriptions

Inclus dans le dashboard, retourne les 5 cours les plus populaires :

```json
[
  ["Spring Boot Avancé", 150],
  ["React JS", 120],
  ["Docker & Kubernetes", 95],
  ["Python pour Data Science", 88],
  ["Angular Framework", 75]
]
```

### Top Enseignants par Nombre de Cours

Inclus dans le dashboard, retourne les 5 enseignants les plus actifs :

```json
[
  ["Dupont", "Jean", 12],
  ["Martin", "Marie", 8],
  ["Bernard", "Luc", 7],
  ["Lefebvre", "Anne", 5],
  ["Moreau", "Pierre", 4]
]
```

### Moyennes de Qualité

- **Moyenne des notes** : Moyenne globale de tous les avis sur tous les cours
- **Taux de complétion moyen** : Pourcentage moyen de progression de toutes les inscriptions actives

---

## 🔐 SÉCURITÉ ET PERMISSIONS

Tous les endpoints du module administration sont protégés par :

```java
@PreAuthorize("hasAuthority('ADMINISTRATEUR')")
```

**Contrôles d'accès** :

- ✅ Seuls les utilisateurs avec le rôle `ADMINISTRATEUR` peuvent accéder
- ✅ Token JWT valide requis dans le header `Authorization: Bearer <token>`
- ✅ Vérification de l'existence des ressources avant modification/suppression
- ✅ Exceptions `ResourceNotFoundException` si ressource introuvable

---

## 🧪 EXEMPLES D'UTILISATION

### Scénario 1 : Tableau de bord du matin

```bash
# L'admin se connecte et consulte le dashboard
GET /api/admin/dashboard
Authorization: Bearer <admin_token>

# Réponse : Statistiques complètes de la plateforme
# → 3 sessions live en ce moment
# → 42 nouvelles inscriptions ce mois
# → Moyenne des notes : 4.3/5
```

### Scénario 2 : Gérer un utilisateur inactif

```bash
# 1. Lister les utilisateurs
GET /api/admin/users

# 2. Identifier un utilisateur inactif (ID 50)
GET /api/admin/users/50

# 3. Désactiver l'utilisateur
PATCH /api/admin/users/50/toggle-status?actif=false
# → "Utilisateur désactivé"

# L'utilisateur ne peut plus se connecter
```

### Scénario 3 : Modérer un cours

```bash
# 1. Consulter les détails d'un cours signalé
GET /api/admin/courses/15

# 2. Décision : Archiver le cours
PATCH /api/admin/courses/15/archive
# → "Cours archivé"

# Le cours n'est plus visible pour les nouveaux étudiants
```

### Scénario 4 : Superviser les inscriptions d'un cours

```bash
# 1. Récupérer toutes les inscriptions du cours 5
GET /api/admin/inscriptions/course/5

# Réponse : Liste de 150 inscriptions avec progression

# 2. Annuler une inscription problématique
PATCH /api/admin/inscriptions/120/cancel
# → "Inscription annulée"
```

---

## 📊 RÉCAPITULATIF DES ENDPOINTS

| Catégorie        | Méthode | Endpoint                                       | Description                       |
| ---------------- | ------- | ---------------------------------------------- | --------------------------------- |
| **Dashboard**    | GET     | `/api/admin/dashboard`                         | Statistiques globales             |
| **Utilisateurs** | GET     | `/api/admin/users`                             | Liste tous les utilisateurs       |
|                  | GET     | `/api/admin/users/{id}`                        | Détails d'un utilisateur          |
|                  | PUT     | `/api/admin/users/{id}`                        | Modifier un utilisateur           |
|                  | PATCH   | `/api/admin/users/{id}/toggle-status`          | Activer/désactiver                |
|                  | DELETE  | `/api/admin/users/{id}`                        | Supprimer un utilisateur          |
| **Cours**        | GET     | `/api/admin/courses`                           | Liste tous les cours              |
|                  | GET     | `/api/admin/courses/{id}`                      | Détails d'un cours                |
|                  | PATCH   | `/api/admin/courses/{id}/archive`              | Archiver un cours                 |
|                  | PATCH   | `/api/admin/courses/{id}/unarchive`            | Désarchiver un cours              |
|                  | DELETE  | `/api/admin/courses/{id}`                      | Supprimer un cours                |
| **Inscriptions** | GET     | `/api/admin/inscriptions`                      | Toutes les inscriptions           |
|                  | GET     | `/api/admin/inscriptions/course/{coursId}`     | Inscriptions d'un cours           |
|                  | GET     | `/api/admin/inscriptions/student/{etudiantId}` | Inscriptions d'un étudiant        |
|                  | PATCH   | `/api/admin/inscriptions/{id}/cancel`          | Annuler une inscription           |
| **Legacy**       | GET     | `/api/admin/utilisateurs`                      | Liste utilisateurs (ancienne API) |
|                  | POST    | `/api/admin/ajouter-admin`                     | Créer un admin                    |
|                  | POST    | `/api/admin/ajouter-enseignant`                | Créer un enseignant               |

**Total** : 19 endpoints dédiés à l'administration

---

## 🗂️ STRUCTURE DES FICHIERS

### DTOs créés

```
model/dto/
├── DashboardStatsDTO.java       # Statistiques dashboard
├── UserManagementDTO.java       # Gestion utilisateurs
├── CourseManagementDTO.java     # Gestion cours
└── InscriptionManagementDTO.java # Gestion inscriptions
```

### Service étendu

```
service/
├── AdministrateurService.java          # Implémentation complète
└── AdministrateurServiceInterface.java # Interface avec 23 méthodes
```

### Controller amélioré

```
controller/
└── AdministrateurController.java # 19 endpoints
```

### Repositories modifiés

```
repository/
├── CoursRepository.java              # + countByArchive, findTop5Enseignants
├── InscriptionRepository.java        # + statistiques, findTop5Courses
├── UtilisateurRepository.java        # + countByDateCreationAfter
├── AvisRepository.java               # + findAverageNote globale
└── SessionStreamingRepository.java   # + countByDateHeureAfter
```

---

## ✅ FONCTIONNALITÉS COMPLÈTES

| Fonctionnalité           | Statut | Description                             |
| ------------------------ | ------ | --------------------------------------- |
| Dashboard global         | ✅     | 20+ métriques en temps réel             |
| Gestion utilisateurs     | ✅     | CRUD complet + activation/désactivation |
| Statistiques par rôle    | ✅     | Étudiants, enseignants, administrateurs |
| Gestion cours            | ✅     | Archivage, désarchivage, suppression    |
| Supervision inscriptions | ✅     | Vue globale, par cours, par étudiant    |
| Annulation inscription   | ✅     | Passe le statut à ABANDONNE             |
| Top cours/enseignants    | ✅     | Top 5 par popularité/activité           |
| Moyennes de qualité      | ✅     | Notes moyennes, taux de complétion      |
| Statistiques mensuelles  | ✅     | Tendances du dernier mois               |
| Sécurité complète        | ✅     | @PreAuthorize sur tous les endpoints    |

---

## 🚀 PROCHAINES AMÉLIORATIONS POSSIBLES

1. **Logs d'audit** : Tracer toutes les actions admin (qui a fait quoi, quand)
2. **Notifications admin** : Alertes sur événements critiques (signalements, inscriptions massives)
3. **Rapports exportables** : Génération PDF/Excel des statistiques
4. **Gestion des rôles avancée** : Sous-rôles admin (modérateur, superviseur)
5. **Sauvegarde/Restauration** : Backup de la base de données
6. **Bannissement IP** : Bloquer des adresses IP malveillantes
7. **Modération contenu** : Système de signalement et validation des cours
8. **Quotas** : Limites par enseignant (nombre de cours, taille uploads)

---

**Documentation générée pour le Module Administration**
**Version 1.0 - Plateforme LMS complète**
