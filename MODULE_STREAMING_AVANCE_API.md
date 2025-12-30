# MODULE 3 - GESTION AVANCÉE DU STREAMING

## Vue d'ensemble

Ce module complète la gestion des sessions de streaming avec :

- ✅ Cycle de vie automatique (CREATED → LIVE → ENDED)
- ✅ Webhooks Ant Media Server pour mises à jour en temps réel
- ✅ Récupération automatique des URL VOD après la fin des lives
- ✅ Contrôle d'accès strict basé sur les inscriptions aux cours

---

## 🔄 Gestion du Cycle de Vie

### États possibles (StreamStatus)

```java
public enum StreamStatus {
    CREATED,    // Session créée mais pas encore démarrée
    LIVE,       // Stream en cours
    ENDED,      // Stream terminé
    FAILED      // Échec technique
}
```

### Transitions automatiques

1. **CREATED → LIVE** : Déclenché par l'enseignant via `/start` ou par webhook Ant Media `liveStreamStarted`
2. **LIVE → ENDED** : Déclenché par l'enseignant via `/stop` ou par webhook Ant Media `liveStreamEnded`
3. **ENDED + VOD** : Webhook `vodReady` enregistre l'URL du fichier MP4

---

## 📡 API REST - SessionStreamingController

### 1. Rejoindre une session (avec vérification d'inscription)

**Endpoint** : `POST /api/sessions/{sessionId}/join/{etudiantId}`

**Rôle requis** : `ETUDIANT`

**Description** : Permet à un étudiant de rejoindre une session. Vérifie automatiquement que l'étudiant est inscrit au cours associé.

**Réponse en cas de succès** :

```json
{
  "id": 10,
  "dateHeure": "2024-12-20T14:00:00",
  "estEnDirect": true,
  "videoUrl": "https://antmedia:5443/LiveApp/streams/stream_12345.m3u8",
  "coursId": 3,
  "enseignantId": 2,
  "streamKey": "stream_12345",
  "status": "LIVE",
  "recordingUrl": null,
  "isRecordingEnabled": true,
  "resolution": "1080p",
  "broadcastType": "WebRTC"
}
```

**Erreurs possibles** :

- `404 NOT FOUND` : Session ou étudiant introuvable
- `403 FORBIDDEN` : L'étudiant n'est pas inscrit au cours
- `403 FORBIDDEN` : L'inscription n'est pas active (TERMINE ou ABANDONNE)

**Exemple d'appel** :

```bash
curl -X POST http://localhost:8080/api/sessions/10/join/15 \
  -H "Authorization: Bearer <token_etudiant>"
```

---

### 2. Récupérer manuellement l'URL du VOD

**Endpoint** : `POST /api/sessions/{id}/fetch-vod`

**Rôle requis** : `ENSEIGNANT`

**Description** : Force la récupération de l'URL du VOD depuis Ant Media Server. Utile si le webhook n'a pas fonctionné.

**Pré-requis** :

- La session doit être à l'état `ENDED`
- Le VOD doit être disponible sur Ant Media Server

**Réponse en cas de succès** :

```json
"VOD récupéré avec succès"
```

**Erreurs possibles** :

- `404 NOT FOUND` : Session introuvable
- `400 BAD REQUEST` : Le stream doit être terminé pour récupérer le VOD
- `400 BAD REQUEST` : VOD pas encore disponible sur Ant Media

**Exemple d'appel** :

```bash
curl -X POST http://localhost:8080/api/sessions/10/fetch-vod \
  -H "Authorization: Bearer <token_enseignant>"
```

---

## 🪝 Webhooks Ant Media

### Configuration côté Ant Media Server

Dans les paramètres d'application Ant Media, configurer l'URL du webhook :

```
http://votre-backend:8080/api/webhook/antmedia
```

### Endpoint webhook

**Endpoint** : `POST /api/webhook/antmedia`

**Authentification** : Aucune (appel depuis Ant Media Server)

**Payload reçu** :

```json
{
  "streamId": "stream_12345",
  "action": "liveStreamStarted",
  "timestamp": 1702995600000,
  "category": "broadcast"
}
```

**Actions supportées** :

- `liveStreamStarted` : Met à jour la session à l'état `LIVE`
- `liveStreamEnded` : Met à jour la session à l'état `ENDED` et tente de récupérer le VOD
- `vodReady` : Enregistre l'URL du fichier MP4 dans `recordingUrl`

### Exemple de traitement

```java
// handleStreamStarted
session.setStatus(StreamStatus.LIVE);
session.setEstEnDirect(true);
session.setDateHeure(LocalDateTime.now());

// handleStreamEnded
session.setStatus(StreamStatus.ENDED);
session.setEstEnDirect(false);
// Tentative immédiate de récupération du VOD

// handleVodReady
String vodUrl = streamingService.getVodUrl(session.getStreamKey());
session.setRecordingUrl(vodUrl);
```

---

## 🎥 Récupération automatique du VOD

### StreamingService.getVodUrl()

**Méthode** : `public String getVodUrl(String streamId)`

**Description** : Appelle l'API REST d'Ant Media Server pour récupérer les détails d'un broadcast et extraire l'URL du fichier MP4.

**URL API Ant Media** :

```
GET http://antmedia:5080/LiveApp/rest/v2/broadcasts/{streamId}
```

**Logique** :

1. Récupération du JSON du broadcast
2. Vérification de `mp4Enabled == 1`
3. Vérification de la présence de `vodPath`
4. Construction de l'URL : `https://antmedia:5443/LiveApp/streams/{streamId}.mp4`

**Retour** :

- URL du VOD si disponible
- `null` si le VOD n'est pas encore prêt

---

## 🔐 Sécurisation des accès

### Vérification d'inscription

Avant de permettre à un étudiant de rejoindre une session, le système vérifie :

1. ✅ L'étudiant existe dans la base de données
2. ✅ La session existe
3. ✅ L'étudiant est inscrit au cours associé à la session
4. ✅ L'inscription est à l'état `ACTIF` (pas `TERMINE` ou `ABANDONNE`)

**Code de vérification** :

```java
Inscription inscription = inscriptionRepository
    .findByEtudiantAndCours(etudiant, session.getCours())
    .orElseThrow(() -> new IllegalStateException(
        "Vous devez être inscrit au cours pour accéder à cette session"));

if (inscription.getStatut() != StatutInscription.ACTIF) {
    throw new IllegalStateException("Votre inscription n'est pas active");
}
```

---

## 📊 Diagramme de séquence - Cycle de vie d'une session

```
Enseignant                Backend                 Ant Media Server
    |                        |                            |
    | POST /sessions/create  |                            |
    |----------------------->|                            |
    |                        | POST /broadcasts/create   |
    |                        |--------------------------->|
    |                        |<---------------------------|
    |                        | streamKey + videoUrl       |
    |<-----------------------|                            |
    | SessionDTO (CREATED)   |                            |
    |                        |                            |
    | POST /sessions/10/start|                            |
    |----------------------->|                            |
    |                        | status = LIVE              |
    |<-----------------------|                            |
    |                        |                            |
    |                        |    Webhook liveStreamStarted
    |                        |<---------------------------|
    |                        | Update status = LIVE       |
    |                        |                            |
[Stream en cours...]        |                            |
    |                        |                            |
    | POST /sessions/10/stop |                            |
    |----------------------->|                            |
    |                        | POST /broadcasts/10/stop  |
    |                        |--------------------------->|
    |                        | status = ENDED             |
    |<-----------------------|                            |
    |                        |                            |
    |                        |    Webhook liveStreamEnded |
    |                        |<---------------------------|
    |                        | Update status = ENDED      |
    |                        |                            |
    |                        |    Webhook vodReady        |
    |                        |<---------------------------|
    |                        | GET /broadcasts/10         |
    |                        |--------------------------->|
    |                        |<---------------------------|
    |                        | recordingUrl = MP4 URL     |
```

---

## 🧪 Tests de validation

### Test 1 : Étudiant inscrit peut rejoindre une session

```bash
# 1. Inscription au cours
POST /api/inscriptions
{
  "etudiantId": 15,
  "coursId": 3
}

# 2. Création d'une session pour le cours 3
POST /api/sessions
{
  "coursId": 3,
  "enseignantId": 2,
  ...
}

# 3. Rejoindre la session
POST /api/sessions/10/join/15
# ✅ Succès : SessionDTO retourné
```

### Test 2 : Étudiant non inscrit ne peut pas rejoindre

```bash
# Tentative de rejoindre sans inscription
POST /api/sessions/10/join/99
# ❌ Erreur 403 : "Vous devez être inscrit au cours pour accéder à cette session"
```

### Test 3 : Récupération du VOD après la fin du live

```bash
# 1. Arrêter le stream
POST /api/sessions/10/stop

# 2. Attendre le traitement du VOD par Ant Media (quelques secondes)

# 3. Récupérer manuellement le VOD
POST /api/sessions/10/fetch-vod
# ✅ Succès : recordingUrl est maintenant renseigné

# 4. Consulter la session
GET /api/sessions/10
# ✅ recordingUrl: "https://antmedia:5443/LiveApp/streams/stream_12345.mp4"
```

---

## 🗂️ Structure des fichiers créés/modifiés

### Nouveaux fichiers

```
src/main/java/com/fstm/ma/ilisi/appstreaming/
├── controller/
│   └── AntMediaWebhookController.java       # Réception des webhooks Ant Media
└── model/dto/
    └── AntMediaWebhookDTO.java              # DTO pour les événements webhook
```

### Fichiers modifiés

```
src/main/java/com/fstm/ma/ilisi/appstreaming/
├── config/
│   └── AntMediaConfig.java                  # + getBroadcastDetailsUrl()
├── service/
│   ├── StreamingService.java                # + getVodUrl(String streamId)
│   ├── SessionStreamingService.java         # + updateRecordingUrl(), joinSession()
│   └── SessionStreamingServiceInterface.java# + déclarations des nouvelles méthodes
└── controller/
    └── SessionStreamingController.java      # + /join, /fetch-vod endpoints
```

---

## ✅ Récapitulatif des fonctionnalités

| Fonctionnalité                      | Statut | Description                                                           |
| ----------------------------------- | ------ | --------------------------------------------------------------------- |
| Cycle de vie CREATED → LIVE → ENDED | ✅     | Gestion automatique via méthodes startStream() / endStream()          |
| Webhooks Ant Media                  | ✅     | Réception de liveStreamStarted, liveStreamEnded, vodReady             |
| Récupération VOD automatique        | ✅     | Appel API REST Ant Media pour obtenir l'URL MP4                       |
| Contrôle d'accès strict             | ✅     | Vérification d'inscription au cours avant jointure                    |
| Endpoint /join                      | ✅     | POST /api/sessions/{sessionId}/join/{etudiantId}                      |
| Endpoint /fetch-vod                 | ✅     | POST /api/sessions/{id}/fetch-vod                                     |
| Gestion des erreurs                 | ✅     | Exceptions claires (ResourceNotFoundException, IllegalStateException) |

---

## 📝 Configuration requise dans application.properties

```properties
# Configuration Ant Media Server
antmedia.server.base-url=http://antmedia:5080
antmedia.server.app=LiveApp

# Webhook URL à configurer dans Ant Media Dashboard
# http://votre-backend:8080/api/webhook/antmedia
```

---

## 🎯 Flux de travail complet

1. **Création de session** : Enseignant crée une session via `/api/sessions`

   - Statut initial : `CREATED`
   - Stream créé sur Ant Media Server
   - `streamKey` et `videoUrl` générés

2. **Démarrage du live** : Enseignant démarre via `/api/sessions/{id}/start`

   - Statut : `LIVE`
   - `estEnDirect = true`
   - Webhook `liveStreamStarted` confirme

3. **Accès étudiant** : Étudiant rejoint via `/api/sessions/{id}/join/{etudiantId}`

   - Vérification de l'inscription au cours
   - Vérification du statut ACTIF
   - Retour de `videoUrl` pour lecture HLS

4. **Fin du live** : Enseignant arrête via `/api/sessions/{id}/stop`

   - Statut : `ENDED`
   - `estEnDirect = false`
   - Webhook `liveStreamEnded` confirme

5. **Disponibilité du VOD** : Webhook `vodReady` reçu
   - `recordingUrl` renseigné automatiquement
   - Étudiants peuvent accéder au replay via `/api/sessions/{id}/url`

---

## 🔗 Intégration avec les modules précédents

### Module 1 - E-Learning

- Les sessions sont liées aux `Cours`
- L'accès aux sessions nécessite une `Inscription` active

### Module 2 - Interactivité Live

- Chat, Q&A, Hand-raise fonctionnent pendant l'état `LIVE`
- Les messages sont persistants même après `ENDED`

### Module 3 - Streaming Avancé

- Gère le cycle de vie complet des sessions
- Assure la traçabilité et la sécurité d'accès
- Automatise la création des VOD pour consultation ultérieure

---

**Documentation générée pour le Module 3 - Gestion Avancée du Streaming**
