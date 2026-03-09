# Guide d'Intégration Stream Éducatif
## Configuration des Endpoints pour Spring Boot + Janus Gateway

Ce guide explique comment configurer correctement les endpoints et services API pour faciliter l'intégration avec votre backend Spring Boot et Janus Gateway.

## 📋 Vue d'ensemble de l'Architecture

```
Frontend React + Tailwind CSS
    ↓
Proxy Server (Supabase/Hono)
    ↓
Spring Boot Backend
    ↓
Janus Gateway (WebRTC)
```

## 🔧 Configuration des Variables d'Environnement

### Backend Spring Boot

Configurez ces variables d'environnement dans votre serveur Supabase :

```bash
# URL de votre backend Spring Boot
SPRING_BOOT_URL=http://localhost:8080

# URL de votre Janus Gateway
JANUS_GATEWAY_URL=ws://localhost:8188

# Configuration TURN/STUN (optionnel)
TURN_SERVERS=[{"urls":"turn:your-turn-server.com:3478","username":"user","credential":"pass"}]
```

### Frontend Configuration

Le frontend utilise une configuration automatique avec fallback :

```typescript
// lib/config.ts
const config = {
  API_URL: 'http://localhost:8080/api',  // Votre Spring Boot
  WS_URL: 'ws://localhost:8080/api',     // WebSocket Spring Boot
  ENVIRONMENT: 'development'
};
```

## 📡 Endpoints Spring Boot Requis

### 1. Session Management

```java
// SessionController.java
@RestController
@RequestMapping("/api/live")
public class LiveSessionController {
    
    @PostMapping("/sessions")
    public ResponseEntity<SessionResponse> createSession(@RequestBody SessionRequest request) {
        // Créer une nouvelle session live
    }
    
    @PostMapping("/sessions/{sessionId}/start")
    public ResponseEntity<StartSessionResponse> startSession(
        @PathVariable String sessionId, 
        @RequestBody WebRTCOfferRequest request) {
        // Démarrer la session avec offer WebRTC
        // Retourner answer WebRTC
    }
    
    @PostMapping("/sessions/{sessionId}/stop")
    public ResponseEntity<Void> stopSession(@PathVariable String sessionId) {
        // Arrêter la session
    }
    
    @PostMapping("/sessions/{sessionId}/join")
    public ResponseEntity<JoinSessionResponse> joinSession(
        @PathVariable String sessionId,
        @RequestBody WebRTCOfferRequest request) {
        // Joindre en tant que spectateur
        // Retourner answer WebRTC
    }
}
```

### 2. WebRTC Signaling

```java
@RestController
@RequestMapping("/api/live/webrtc")
public class WebRTCController {
    
    @PostMapping("/offer")
    public ResponseEntity<WebRTCAnswerResponse> handleOffer(@RequestBody WebRTCOfferRequest request) {
        // Traiter l'offer WebRTC
        // Communiquer avec Janus Gateway
        // Retourner answer
    }
    
    @PostMapping("/ice-candidate")
    public ResponseEntity<Void> handleIceCandidate(@RequestBody ICECandidateRequest request) {
        // Transmettre ICE candidate à Janus
    }
}
```

### 3. Chat & Q&A

```java
@RestController
@RequestMapping("/api/live/chat")
public class ChatController {
    
    @PostMapping("/messages")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessageRequest request) {
        // Envoyer message de chat
    }
    
    @GetMapping("/messages/{sessionId}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable String sessionId) {
        // Récupérer historique du chat
    }
}
```

### 4. WebSocket pour Temps Réel

```java
@Component
public class LiveWebSocketHandler extends TextWebSocketHandler {
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Connexion WebSocket établie
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Traiter messages temps réel
    }
}

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new LiveWebSocketHandler(), "/api/live/ws/{sessionId}")
                .setAllowedOrigins("*");
    }
}
```

## 🎯 Configuration Janus Gateway

### 1. Configuration de Base

```ini
# janus.cfg
[general]
admin_secret = "your-admin-secret"
api_secret = "your-api-secret"

[webserver]
base_path = /janus
port = 8088
https = no

[websockets]
ws = yes
ws_port = 8188
```

### 2. Plugin VideoRoom

```ini
# janus.plugin.videoroom.cfg
[general]
admin_key = "your-admin-key"
```

### 3. Plugin Streaming

```ini
# janus.plugin.streaming.cfg
[general]
admin_key = "your-admin-key"
```

## 🔄 Flux d'Intégration

### 1. Initialisation du Service

```typescript
// Le service s'initialise automatiquement
import { useStreamingContext } from './components/live/StreamingServiceProvider';

function MyComponent() {
  const { isInitialized, serviceStatus } = useStreamingContext();
  
  if (!isInitialized) {
    return <div>Initialisation des services...</div>;
  }
  
  // Le service détecte automatiquement Spring Boot + Janus
  // et utilise le mode fallback si nécessaire
}
```

### 2. Création et Démarrage d'une Session

```typescript
const { createSession, startStreaming } = useStreamingContext();

// Créer session
const session = await createSession(
  'course-id',
  'Titre du cours',
  'Description',
  {
    quality: 'HD',
    allowChat: true,
    allowQA: true,
    recordSession: true,
    maxViewers: 100,
    isPrivate: false
  }
);

// Démarrer streaming
await startStreaming(session.id, {
  video: { width: 1280, height: 720, frameRate: 30 },
  audio: { echoCancellation: true, noiseSuppression: true }
});
```

### 3. Rejoindre en tant que Spectateur

```typescript
const { joinAsViewer } = useStreamingContext();

const remoteStream = await joinAsViewer('session-id');

// Utiliser le stream dans un élément video
const videoElement = document.getElementById('remoteVideo');
videoElement.srcObject = remoteStream;
```

## 🚨 Gestion des Erreurs et Fallbacks

Le système gère automatiquement 3 modes :

### 1. Mode Production (Spring Boot + Janus)
- Tous les services backend disponibles
- Qualité optimale
- Toutes les fonctionnalités

### 2. Mode Spring Boot Only
- Spring Boot disponible, Janus indisponible
- WebRTC direct sans Janus
- Fonctionnalités réduites

### 3. Mode Fallback (Développement)
- Aucun backend disponible
- Simulation locale
- Interface complète pour développement

```typescript
// Vérification automatique des services
const { getServiceStatus } = useStreamingContext();

const status = await getServiceStatus();
console.log('Spring Boot:', status.integration.springBoot.available);
console.log('Janus Gateway:', status.integration.janus.available);
console.log('Fallback Mode:', status.integration.fallbackMode);
```

## 🛠 Utilitaires de Debug

### Panel de Debug

```tsx
import { StreamingDebugPanel } from './components/live/StreamingServiceProvider';

function DeveloperPage() {
  return (
    <div>
      <h1>Développement</h1>
      <StreamingDebugPanel />
    </div>
  );
}
```

### Logs et Monitoring

```typescript
// Les services loggent automatiquement leur état
// Vérifiez la console pour :
// - État des connexions
// - Erreurs WebRTC
// - Messages WebSocket
// - Statistiques de streaming
```

## 📋 Checklist de Déploiement

### Backend Spring Boot

- [ ] Endpoints `/api/live/*` implémentés
- [ ] WebSocket `/api/live/ws/{sessionId}` configuré
- [ ] CORS configuré pour le frontend
- [ ] Authentication/Authorization en place
- [ ] Logging activé

### Janus Gateway

- [ ] Instance Janus démarrée
- [ ] Plugins VideoRoom et Streaming activés
- [ ] Configuration WebSocket
- [ ] Secrets configurés
- [ ] STUN/TURN servers configurés

### Frontend

- [ ] Variables d'environnement définies
- [ ] StreamingServiceProvider intégré
- [ ] Composants live mis à jour
- [ ] Tests de connectivité effectués

## 🔍 Dépannage

### Problème : "Spring Boot not available"
- Vérifiez l'URL dans `SPRING_BOOT_URL`
- Vérifiez que Spring Boot répond sur `/actuator/health`
- Vérifiez les logs Spring Boot

### Problème : "Janus Gateway not available"
- Vérifiez l'URL WebSocket Janus
- Vérifiez que Janus est démarré
- Testez la connexion WebSocket manuellement

### Problème : "WebRTC connection failed"
- Vérifiez les serveurs STUN/TURN
- Vérifiez les permissions microphone/caméra
- Vérifiez les logs WebRTC dans la console

## 📚 Ressources Supplémentaires

- [Documentation Janus Gateway](https://janus.conf.meetecho.com/docs/)
- [Spring Boot WebSocket Guide](https://spring.io/guides/gs/messaging-stomp-websocket/)
- [WebRTC API Documentation](https://developer.mozilla.org/docs/Web/API/WebRTC_API)

## 💡 Exemples d'Implémentation

Consultez les fichiers suivants pour des exemples complets :

- `/lib/integration.ts` - Service d'intégration
- `/lib/streaming.ts` - Service de streaming haut niveau
- `/lib/api.ts` - Client API avec routage intelligent
- `/supabase/functions/server/index.tsx` - Serveur proxy avec endpoints
- `/components/live/StreamingServiceProvider.tsx` - Provider React

Cette configuration permet une intégration fluide avec votre backend tout en maintenant la flexibilité pour le développement local.