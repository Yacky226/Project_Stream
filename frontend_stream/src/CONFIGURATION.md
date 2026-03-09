# Configuration - Stream Éducatif

## Variables d'environnement

### Développement

Par défaut, l'application utilise ces valeurs pour le développement local :

- **API_URL**: `http://localhost:8080/api`
- **WS_URL**: `ws://localhost:8080/api`
- **ENVIRONMENT**: `development`

### Production

Pour la production, vous pouvez configurer l'application de plusieurs façons :

#### 1. Configuration globale dans index.html

Ajoutez un script dans votre `index.html` :

```html
<script>
  window.APP_CONFIG = {
    API_URL: 'https://your-spring-boot-backend.com/api',
    WS_URL: 'wss://your-spring-boot-backend.com/api',
    ENVIRONMENT: 'production'
  };
</script>
```

#### 2. Configuration par build

Modifiez directement les valeurs dans `/lib/config.ts` avant le build :

```typescript
const DEFAULT_CONFIG: AppConfig = {
  API_URL: 'https://your-production-api.com/api',
  WS_URL: 'wss://your-production-api.com/api',
  ENVIRONMENT: 'production'
};
```

## Configuration du Backend Spring Boot

Assurez-vous que votre backend Spring Boot expose les endpoints suivants :

### API Endpoints

- `POST /api/live/sessions` - Créer une session
- `POST /api/live/sessions/{id}/start` - Démarrer une session
- `POST /api/live/sessions/{id}/stop` - Arrêter une session
- `GET /api/live/sessions/{id}` - Obtenir les détails d'une session
- `POST /api/live/chat/messages` - Envoyer un message
- `POST /api/live/qa/questions` - Poser une question

### WebSocket Endpoints

- `ws://your-backend/api/live/ws/{sessionId}` - Connexion temps réel

### WebRTC Signaling

- `POST /api/live/webrtc/offer` - Envoyer une offre WebRTC
- `POST /api/live/webrtc/answer` - Envoyer une réponse WebRTC
- `POST /api/live/webrtc/ice-candidate` - Envoyer un candidat ICE

## Configuration CORS

N'oubliez pas de configurer CORS sur votre backend pour autoriser les requêtes depuis votre frontend :

```java
@CrossOrigin(origins = {"http://localhost:3000", "https://your-frontend-domain.com"})
```

## Configuration Janus Gateway

Le système utilise Janus Gateway pour le streaming WebRTC. Consultez la documentation Janus pour l'installation et la configuration.

## Variables d'environnement optionnelles

Vous pouvez également définir :

- `TURN_SERVER_URL` - Serveur TURN pour NAT traversal
- `TURN_SERVER_USERNAME` - Nom d'utilisateur TURN
- `TURN_SERVER_CREDENTIAL` - Mot de passe TURN

## Debug

En mode développement, la configuration est accessible via `window.STREAM_CONFIG` dans la console du navigateur.