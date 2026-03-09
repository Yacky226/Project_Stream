# Module Interactivité Live - Documentation WebSocket

## Vue d'ensemble

Ce module implémente toute l'interactivité temps réel pour les sessions de streaming live via WebSocket (STOMP).

## Architecture WebSocket

### Configuration

- **Endpoint WebSocket**: `/ws-stream` (avec fallback SockJS)
- **Préfixe application**: `/app`
- **Préfixe topics**: `/topic`

### Topics Dynamiques par Session

Tous les topics sont dynamiques et incluent l'ID de la session : `{sessionId}`

---

## 1. Chat en Temps Réel

### Entités

- **ChatMessage**: Message persisté en base de données
- Champs: `contenu`, `timestamp`, `expediteur`, `session`

### WebSocket

#### Envoyer un message

```javascript
// Client envoie
stompClient.send(
  "/app/chat.send/{sessionId}",
  {},
  JSON.stringify({
    contenu: "Hello world!",
    expediteurId: 123,
    sessionId: 1,
  })
);

// Tous les clients reçoivent sur
subscribe("/topic/chat/{sessionId}");
```

### REST API

#### Récupérer l'historique

- **GET** `/api/chat/history/{sessionId}`
- **Autorisation**: Authentifié
- **Retour**: Liste complète des messages

#### Récupérer les messages récents

- **GET** `/api/chat/recent/{sessionId}?since=2025-11-30T10:00:00`
- **Autorisation**: Authentifié

#### Supprimer l'historique

- **DELETE** `/api/chat/{sessionId}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

### Format du Message

```json
{
  "id": 1,
  "contenu": "Bonjour à tous!",
  "timestamp": "2025-11-30T10:15:00",
  "expediteurId": 123,
  "expediteurNom": "John Doe",
  "expediteurPhoto": "https://...",
  "expediteurRole": "ETUDIANT",
  "sessionId": 1
}
```

---

## 2. Système Q&A (Questions/Réponses)

### Entités

- **Question**: Question posée pendant le live
- **Vote**: Table de liaison pour éviter les votes multiples
- Champs: `contenu`, `votes`, `estRepondue`, `auteur`, `session`

### Logique Métier

- Un utilisateur ne peut voter qu'une fois par question
- Les questions sont triées par nombre de votes (DESC) puis par date (ASC)
- L'enseignant peut marquer une question comme répondue

### WebSocket

#### Créer une question

```javascript
// Client envoie
stompClient.send(
  "/app/question.create/{sessionId}",
  {},
  JSON.stringify({
    contenu: "Comment fait-on pour...?",
    auteurId: 123,
    sessionId: 1,
  })
);

// Tous les clients reçoivent la nouvelle question sur
subscribe("/topic/questions/{sessionId}");
```

#### Voter pour une question

```javascript
// Client envoie
stompClient.send("/app/question.upvote/{sessionId}/{questionId}", {}, userId);

// Tous les clients reçoivent la mise à jour sur
subscribe("/topic/questions/{sessionId}/update");
```

#### Marquer comme répondue

```javascript
// Enseignant envoie
stompClient.send("/app/question.answered/{sessionId}/{questionId}", {});

// Tous les clients reçoivent la mise à jour sur
subscribe("/topic/questions/{sessionId}/update");
```

### REST API

#### Créer une question

- **POST** `/api/questions`
- **Autorisation**: Authentifié
- **Body**:

```json
{
  "contenu": "Ma question ici?",
  "auteurId": 123,
  "sessionId": 1
}
```

#### Récupérer les questions d'une session

- **GET** `/api/questions/session/{sessionId}?userId={id}`
- **Autorisation**: Authentifié
- **Paramètre optionnel**: `userId` pour inclure le statut de vote de l'utilisateur

#### Récupérer les questions non répondues

- **GET** `/api/questions/session/{sessionId}/pending`
- **Autorisation**: Authentifié

#### Voter pour une question

- **POST** `/api/questions/{questionId}/upvote?userId={id}`
- **Autorisation**: Authentifié
- **Action**: Incrémente le compteur de votes, crée un Vote en base

#### Retirer son vote

- **DELETE** `/api/questions/{questionId}/upvote?userId={id}`
- **Autorisation**: Authentifié
- **Action**: Décrémente le compteur de votes, supprime le Vote

#### Marquer comme répondue

- **PUT** `/api/questions/{questionId}/answered`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

#### Supprimer une question

- **DELETE** `/api/questions/{questionId}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

### Format de la Question

```json
{
  "id": 1,
  "contenu": "Comment fait-on pour déployer l'app?",
  "timestamp": "2025-11-30T10:20:00",
  "votes": 5,
  "estRepondue": false,
  "auteurId": 123,
  "auteurNom": "Jane Smith",
  "auteurPhoto": "https://...",
  "sessionId": 1,
  "userHasVoted": true
}
```

---

## 3. Gestion des Mains Levées (Hand Raise)

### Entités

- **HandRaise**: Demande de parole avec statut
- Statuts: `PENDING`, `SPEAKING`, `COMPLETED`, `CANCELLED`
- Champs: `etudiant`, `session`, `timestampDemande`, `statut`, `ordre`

### Logique Métier

- File d'attente automatique par ordre de demande
- Un étudiant ne peut avoir qu'une seule main levée active à la fois
- L'enseignant accorde la parole dans l'ordre de la file
- Quand la parole est accordée, le frontend active le micro de l'étudiant

### WebSocket

#### Lever la main

```javascript
// Étudiant envoie
stompClient.send("/app/handraise.raise/{sessionId}", {}, etudiantId);

// Tous les clients reçoivent la nouvelle demande sur
subscribe("/topic/handraises/{sessionId}");

// Et la file d'attente mise à jour sur
subscribe("/topic/handraises/{sessionId}/queue");
```

#### Baisser la main

```javascript
// Étudiant envoie
stompClient.send("/app/handraise.lower/{sessionId}", {}, etudiantId);

// Tous les clients reçoivent sur
subscribe("/topic/handraises/{sessionId}/lowered");

// Et la file d'attente mise à jour
subscribe("/topic/handraises/{sessionId}/queue");
```

#### Accorder la parole

```javascript
// Enseignant envoie
stompClient.send("/app/handraise.grant/{sessionId}", {}, handRaiseId);

// Tous les clients reçoivent sur
subscribe("/topic/handraises/{sessionId}/granted");
// Le frontend active alors le micro de cet étudiant

// Et la file d'attente mise à jour
subscribe("/topic/handraises/{sessionId}/queue");
```

### REST API

#### Lever la main

- **POST** `/api/handraises/raise?etudiantId={id}&sessionId={id}`
- **Autorisation**: `ETUDIANT`

#### Baisser la main

- **POST** `/api/handraises/lower?etudiantId={id}&sessionId={id}`
- **Autorisation**: `ETUDIANT`

#### Accorder la parole

- **POST** `/api/handraises/{handRaiseId}/grant`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`
- **Action**: Change le statut à `SPEAKING`

#### Terminer la prise de parole

- **POST** `/api/handraises/{handRaiseId}/complete`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`
- **Action**: Change le statut à `COMPLETED`

#### Récupérer la file d'attente

- **GET** `/api/handraises/session/{sessionId}/queue`
- **Autorisation**: Authentifié
- **Retour**: Liste ordonnée des demandes en attente

#### Récupérer l'étudiant qui parle

- **GET** `/api/handraises/session/{sessionId}/speaker`
- **Autorisation**: Authentifié
- **Retour**: HandRaise avec statut `SPEAKING` ou `null`

#### Effacer toutes les mains levées

- **DELETE** `/api/handraises/session/{sessionId}`
- **Autorisation**: `ENSEIGNANT`, `ADMINISTRATEUR`

### Format HandRaise

```json
{
  "id": 1,
  "etudiantId": 123,
  "etudiantNom": "Alice Johnson",
  "etudiantPhoto": "https://...",
  "sessionId": 1,
  "timestampDemande": "2025-11-30T10:25:00",
  "statut": "PENDING",
  "timestampAccorde": null,
  "timestampFin": null,
  "ordre": 1
}
```

---

## Intégration Frontend

### Connexion WebSocket

```typescript
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socket = new SockJS("http://localhost:8080/ws-stream");
const stompClient = new Client({
  webSocketFactory: () => socket,
  onConnect: () => {
    console.log("Connected to WebSocket");

    // S'abonner aux topics
    stompClient.subscribe("/topic/chat/1", (message) => {
      const chatMsg = JSON.parse(message.body);
      // Afficher le message dans l'UI
    });

    stompClient.subscribe("/topic/questions/1", (message) => {
      const question = JSON.parse(message.body);
      // Ajouter la question à la liste
    });

    stompClient.subscribe("/topic/handraises/1/queue", (message) => {
      const queue = JSON.parse(message.body);
      // Mettre à jour la file d'attente dans l'UI
    });
  },
});

stompClient.activate();
```

### Envoyer un message de chat

```typescript
const sendChatMessage = (
  content: string,
  userId: number,
  sessionId: number
) => {
  stompClient.publish({
    destination: `/app/chat.send/${sessionId}`,
    body: JSON.stringify({
      contenu: content,
      expediteurId: userId,
      sessionId: sessionId,
    }),
  });
};
```

### Voter pour une question

```typescript
const upvoteQuestion = (
  questionId: number,
  userId: number,
  sessionId: number
) => {
  // Via REST (recommandé pour la fiabilité)
  fetch(`/api/questions/${questionId}/upvote?userId=${userId}`, {
    method: "POST",
  });

  // OU via WebSocket
  stompClient.publish({
    destination: `/app/question.upvote/${sessionId}/${questionId}`,
    body: JSON.stringify(userId),
  });
};
```

### Lever la main

```typescript
const raiseHand = (studentId: number, sessionId: number) => {
  fetch(
    `/api/handraises/raise?etudiantId=${studentId}&sessionId=${sessionId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Les autres participants recevront la mise à jour via WebSocket
};
```

### Gérer l'activation du micro (côté frontend)

```typescript
// S'abonner aux notifications de parole accordée
stompClient.subscribe("/topic/handraises/1/granted", (message) => {
  const handRaise = JSON.parse(message.body);

  if (handRaise.etudiantId === currentUserId) {
    // C'est notre tour de parler
    enableMicrophone();
    showNotification("Vous avez la parole!");
  }
});
```

---

## Flux Complet d'un Live Interactif

### 1. Démarrage du Live

```typescript
// Enseignant démarre la session
POST / api / sessions / { id } / start;

// Tous les étudiants se connectent au WebSocket
const sessionId = 1;
stompClient.subscribe(`/topic/chat/${sessionId}`);
stompClient.subscribe(`/topic/questions/${sessionId}`);
stompClient.subscribe(`/topic/questions/${sessionId}/update`);
stompClient.subscribe(`/topic/handraises/${sessionId}/queue`);
stompClient.subscribe(`/topic/handraises/${sessionId}/granted`);
```

### 2. Pendant le Live

#### Chat actif

```typescript
// Les participants envoient des messages
sendChatMessage("Super cours!", userId, sessionId);
// Tous reçoivent instantanément le message
```

#### Questions posées

```typescript
// Un étudiant pose une question
POST /api/questions
// Tous voient la question apparaître

// D'autres votent
POST /api/questions/5/upvote?userId=456
// La question remonte dans la liste triée

// L'enseignant répond et marque comme répondue
PUT /api/questions/5/answered
// La question passe en vert avec ✓
```

#### Demande de parole

```typescript
// Étudiant lève la main
POST /api/handraises/raise?etudiantId=123&sessionId=1
// Il apparaît dans la file d'attente (ordre 1)

// Enseignant accorde la parole
POST /api/handraises/1/grant
// Le micro de l'étudiant s'active automatiquement
// Les autres voient qu'il parle

// Fin de la prise de parole
POST /api/handraises/1/complete
// Le micro se désactive
```

### 3. Fin du Live

```typescript
// Enseignant termine
POST / api / sessions / { id } / end;

// Optionnel: Nettoyer les données temporaires
DELETE / api / handraises / session / { sessionId };
DELETE / api / chat / { sessionId };
```

---

## Sécurité

### Authentification WebSocket

- La connexion WebSocket hérite de l'authentification HTTP (JWT)
- Les annotations `@PreAuthorize` sont respectées sur tous les endpoints

### Validation des Actions

- **Chat**: Tout utilisateur authentifié peut envoyer des messages
- **Questions**: Tout utilisateur authentifié peut poser des questions et voter
- **Marquer comme répondue**: Réservé à `ENSEIGNANT` et `ADMINISTRATEUR`
- **Mains levées**: Seuls les `ETUDIANT` peuvent lever/baisser la main
- **Accorder la parole**: Réservé à `ENSEIGNANT` et `ADMINISTRATEUR`

### Prévention des Abus

- **Vote unique**: Un utilisateur ne peut voter qu'une fois par question (contrainte DB)
- **Main levée unique**: Un étudiant ne peut avoir qu'une main levée active
- **Validation côté serveur**: Toutes les actions sont validées avant diffusion

---

## Persistence des Données

### Données Persistées

- ✅ **ChatMessage**: Tous les messages sont sauvegardés en base
- ✅ **Question**: Toutes les questions sont sauvegardées
- ✅ **Vote**: Tous les votes sont trackés
- ✅ **HandRaise**: Toutes les demandes sont enregistrées avec leur historique

### Avantages

- Historique complet disponible après le live
- Récupération en cas de déconnexion
- Analytics et statistiques possibles
- Replay du live avec les interactions

---

## Tests Recommandés

### Test du Chat

1. Connecter 2+ clients au même `sessionId`
2. Envoyer un message depuis le client A
3. Vérifier réception instantanée sur client B
4. Récupérer l'historique via REST API

### Test des Questions

1. Créer une question
2. Voter depuis plusieurs comptes différents
3. Tenter de voter 2 fois (doit échouer)
4. Marquer comme répondue (enseignant uniquement)

### Test des Mains Levées

1. Lever la main (étudiant)
2. Vérifier apparition dans la file d'attente
3. Accorder la parole (enseignant)
4. Vérifier notification reçue par l'étudiant

---

## Prochaines Améliorations Possibles

1. **Réactions emoji** sur les messages de chat
2. **Sondages en direct** pendant le live
3. **Transcription automatique** du chat et des Q&A
4. **Statistiques en temps réel** (nombre de participants actifs, messages/min, etc.)
5. **Modération automatique** du chat (filtrage de mots)
6. **Breakout rooms** pour des discussions en petits groupes

---

## Technologies Utilisées

- **WebSocket**: STOMP over SockJS
- **Spring Messaging**: `@MessageMapping`, `SimpMessageSendingOperations`
- **Persistance**: Spring Data JPA avec PostgreSQL
- **Sécurité**: Spring Security avec JWT

Le Module Interactivité Live est maintenant complet et prêt pour l'intégration frontend !
