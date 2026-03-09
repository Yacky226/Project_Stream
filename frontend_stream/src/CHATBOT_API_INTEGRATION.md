# 🤖 Guide d'Intégration API Chatbot

Ce guide explique comment intégrer une vraie API de chatbot (OpenAI, Anthropic Claude, Google Gemini) dans Stream Éducatif.

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Configuration Rapide](#configuration-rapide)
3. [Providers Supportés](#providers-supportés)
4. [Intégration OpenAI](#intégration-openai)
5. [Intégration Anthropic Claude](#intégration-anthropic-claude)
6. [Intégration Google Gemini](#intégration-google-gemini)
7. [Personnalisation](#personnalisation)
8. [Sécurité](#sécurité)

---

## 🏗️ Architecture

Le système de chatbot utilise une architecture modulaire qui permet de changer facilement de provider :

```
/lib/chatbotConfig.ts       → Configuration des providers
/lib/chatbotApiService.ts   → Service API abstrait
/lib/chatbotService.ts      → Service métier (logique contextuelle)
/components/chatbot/        → Composants UI
/store/slices/chatbotSlice.ts → État Redux
```

### Flux de Données

```
User Input → ChatInput → Chatbot Component → ChatbotApiService → API Provider
                ↓                                    ↓
         Redux Store ← chatbotSlice ← Response Processing
```

---

## ⚡ Configuration Rapide

### Étape 1 : Choisir un Provider

Modifiez `/lib/chatbotConfig.ts` pour changer le provider par défaut :

```typescript
export const defaultConfig: ChatbotConfig = {
  provider: 'openai', // Changez de 'mock' à 'openai', 'anthropic', ou 'gemini'
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Votre prompt système personnalisé...`
};
```

### Étape 2 : Ajouter la Clé API

Créez un fichier `.env.local` à la racine du projet :

```bash
# Pour OpenAI
OPENAI_API_KEY=sk-...

# Pour Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# Pour Google Gemini
GEMINI_API_KEY=...
```

### Étape 3 : Mettre à Jour le Service

Dans `/lib/chatbotService.ts`, remplacez l'appel mock par le service API :

```typescript
import { createChatbotService } from './chatbotApiService';

const chatbotService = createChatbotService('openai');

export async function getChatbotResponseAsync(
  userMessage: string,
  context: ChatContext
): Promise<ChatbotResponse> {
  // Construire l'historique des messages
  const messages = [
    ...context.conversationHistory || [],
    { role: 'user', content: userMessage }
  ];

  // Appel à l'API
  const response = await chatbotService.sendMessage({
    messages,
    temperature: 0.7,
    maxTokens: 500
  });

  return {
    message: response.content,
    timestamp: new Date(),
    confidence: 0.95
  };
}
```

---

## 🎯 Providers Supportés

### 1. OpenAI GPT

**Avantages:**
- Réponses de haute qualité
- Large base de connaissances
- Excellente compréhension du contexte

**Modèles disponibles:**
- `gpt-4-turbo-preview` - Le plus capable
- `gpt-4` - Équilibré
- `gpt-3.5-turbo` - Rapide et économique

### 2. Anthropic Claude

**Avantages:**
- Très sûr et éthique
- Excellente pour les conversations longues
- Bonne compréhension des nuances

**Modèles disponibles:**
- `claude-3-opus-20240229` - Le plus capable
- `claude-3-sonnet-20240229` - Équilibré
- `claude-3-haiku-20240307` - Rapide

### 3. Google Gemini

**Avantages:**
- Multimodal (texte + images)
- Très rapide
- Gratuit pour usage modéré

**Modèles disponibles:**
- `gemini-pro` - Standard
- `gemini-pro-vision` - Avec vision

---

## 🔑 Intégration OpenAI

### Configuration Complète

```typescript
// /lib/chatbotConfig.ts
import { ChatbotProvider } from './chatbotConfig';

export const openaiConfig = {
  provider: 'openai' as ChatbotProvider,
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Tu es un assistant virtuel pour Stream Éducatif.
  
Contexte:
- Plateforme de streaming éducatif en direct
- Utilisateurs: étudiants, enseignants, administrateurs
- Fonctionnalités: cours en live, replay, chat, Q&A

Instructions:
- Réponds de manière concise et professionnelle
- Utilise un ton amical mais respectueux
- Si tu ne sais pas, redirige vers le support
- Adapte tes réponses au rôle de l'utilisateur`
};
```

### Utilisation Avancée avec Streaming

```typescript
export async function getChatbotResponseWithStreaming(
  userMessage: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: userMessage }],
      stream: true
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) onChunk(content);
        } catch (e) {
          // Ignorer les erreurs de parsing
        }
      }
    }
  }
}
```

---

## 🧠 Intégration Anthropic Claude

### Configuration

```typescript
// .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...

// /lib/chatbotConfig.ts
export const anthropicConfig = {
  provider: 'anthropic',
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `Votre prompt système`
};
```

### Exemple d'Utilisation

```typescript
import { createChatbotService } from './chatbotApiService';

const claudeService = createChatbotService(
  'anthropic',
  process.env.ANTHROPIC_API_KEY
);

const response = await claudeService.sendMessage({
  messages: [
    { role: 'user', content: 'Comment puis-je m\'inscrire à un cours ?' }
  ]
});

console.log(response.content);
```

---

## 🌐 Intégration Google Gemini

### Configuration

```typescript
// .env.local
GEMINI_API_KEY=AIzaSy...

// /lib/chatbotConfig.ts
export const geminiConfig = {
  provider: 'gemini',
  model: 'gemini-pro',
  temperature: 0.7,
  maxTokens: 500
};
```

### Exemple avec Vision (Analyse d'Images)

```typescript
const geminiVisionService = createChatbotService('gemini');
geminiVisionService.updateConfig({ model: 'gemini-pro-vision' });

const response = await geminiVisionService.sendMessage({
  messages: [
    {
      role: 'user',
      content: 'Analyse cette capture d\'écran de cours'
    }
  ],
  imageData: base64Image // Optionnel pour gemini-pro-vision
});
```

---

## 🎨 Personnalisation

### Modifier le Prompt Système

Le prompt système définit le comportement et la personnalité de votre chatbot :

```typescript
export const customSystemPrompt = `Tu es Alex, l'assistant IA de Stream Éducatif.

PERSONNALITÉ:
- Enthousiaste et motivant
- Patient et pédagogue
- Humour léger bienvenu

CONNAISSANCES:
- Catalogue de cours complet
- Fonctionnalités de la plateforme
- Meilleures pratiques d'apprentissage en ligne

LIMITATIONS:
- Ne donne pas de conseils médicaux/juridiques
- Redirige vers le support pour les problèmes techniques complexes
- Ne partage jamais d'informations confidentielles

STYLE DE RÉPONSE:
- Commence par saluer chaleureusement
- Utilise des emojis avec modération (📚 ✨ 🎓)
- Termine par une question ouverte si pertinent`;
```

### Ajouter des Actions Contextuelles

```typescript
interface ChatbotResponse {
  message: string;
  action?: {
    type: 'navigate' | 'open_modal' | 'start_course';
    payload: any;
  };
  suggestions?: string[];
}

// Exemple d'utilisation
if (userMessage.includes('inscription')) {
  return {
    message: 'Je peux vous aider à vous inscrire ! Voici les cours disponibles.',
    action: {
      type: 'navigate',
      payload: '/catalog'
    },
    suggestions: [
      'Cours de programmation',
      'Cours de design',
      'Cours de marketing'
    ]
  };
}
```

### Configurer les Quick Actions

Dans `/store/slices/chatbotSlice.ts`:

```typescript
const initialState: ChatbotState = {
  quickActions: [
    {
      label: 'Comment m\'inscrire à un cours ?',
      category: 'navigation',
      roles: ['student']
    },
    {
      label: 'Comment créer une session live ?',
      category: 'teaching',
      roles: ['teacher']
    },
    {
      label: 'Voir les statistiques de la plateforme',
      category: 'admin',
      roles: ['admin']
    },
    // Ajoutez vos propres actions...
  ]
};
```

---

## 🔒 Sécurité

### ⚠️ Bonnes Pratiques

1. **Ne JAMAIS exposer les clés API au client**
   ```typescript
   // ❌ MAUVAIS - Ne faites JAMAIS ça
   const apiKey = 'sk-...';
   
   // ✅ BON - Utilisez des variables d'environnement serveur
   const apiKey = process.env.OPENAI_API_KEY;
   ```

2. **Implémenter un Rate Limiting**
   ```typescript
   // Exemple simple
   const rateLimiter = new Map();
   
   function checkRateLimit(userId: string): boolean {
     const now = Date.now();
     const userRequests = rateLimiter.get(userId) || [];
     const recentRequests = userRequests.filter(
       time => now - time < 60000 // 1 minute
     );
     
     if (recentRequests.length >= 10) {
       return false; // Trop de requêtes
     }
     
     userRequests.push(now);
     rateLimiter.set(userId, userRequests);
     return true;
   }
   ```

3. **Filtrer et Valider les Entrées**
   ```typescript
   function sanitizeInput(input: string): string {
     return input
       .trim()
       .slice(0, 1000) // Limite de caractères
       .replace(/<script>/gi, ''); // Protection XSS basique
   }
   ```

4. **Implémenter un Système de Modération**
   ```typescript
   async function moderateContent(text: string): Promise<boolean> {
     const response = await openai.moderations.create({
       input: text
     });
     
     return !response.results[0].flagged;
   }
   ```

### Configuration CORS

Si vous utilisez un backend séparé :

```typescript
// Backend API
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Monitoring et Analytics

### Tracking des Conversations

```typescript
interface ConversationMetrics {
  sessionId: string;
  userId: string;
  messageCount: number;
  avgResponseTime: number;
  userSatisfaction?: number;
  resolvedIssue: boolean;
}

export function trackConversation(metrics: ConversationMetrics) {
  // Envoyez à votre service d'analytics
  analytics.track('chatbot_conversation', metrics);
}
```

### Logging des Erreurs

```typescript
export async function sendMessageWithLogging(
  message: string
): Promise<ChatCompletionResponse> {
  const startTime = Date.now();
  
  try {
    const response = await chatbotService.sendMessage({ messages });
    
    // Log succès
    logger.info('Chatbot response success', {
      duration: Date.now() - startTime,
      tokens: response.usage?.totalTokens
    });
    
    return response;
  } catch (error) {
    // Log erreur
    logger.error('Chatbot response failed', {
      error: error.message,
      duration: Date.now() - startTime
    });
    
    throw error;
  }
}
```

---

## 🧪 Tests

### Test Unitaire du Service

```typescript
import { createChatbotService } from './chatbotApiService';

describe('ChatbotApiService', () => {
  it('should send message and receive response', async () => {
    const service = createChatbotService('mock');
    
    const response = await service.sendMessage({
      messages: [
        { role: 'user', content: 'Hello' }
      ]
    });
    
    expect(response.content).toBeDefined();
    expect(response.finishReason).toBe('stop');
  });
});
```

---

## 🚀 Déploiement

### Variables d'Environnement en Production

```bash
# Vercel / Netlify
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Rate limiting
MAX_REQUESTS_PER_MINUTE=10
MAX_TOKENS_PER_REQUEST=500

# Feature flags
ENABLE_CHATBOT=true
CHATBOT_PROVIDER=openai
```

### Checklist de Déploiement

- [ ] Clés API configurées dans l'environnement de production
- [ ] Rate limiting activé
- [ ] Modération de contenu implémentée
- [ ] Monitoring et alertes configurés
- [ ] Tests de charge effectués
- [ ] Documentation utilisateur mise à jour

---

## 📚 Ressources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com)
- [Google Gemini API](https://ai.google.dev/docs)
- [Best Practices for AI Safety](https://www.anthropic.com/index/claude-2-1-prompting)

---

## 💡 Support

Pour toute question sur l'intégration du chatbot :
1. Consultez la documentation détaillée dans `/CHATBOT_DOCUMENTATION.md`
2. Vérifiez les exemples de code dans `/lib/chatbotApiService.ts`
3. Contactez l'équipe de développement

**Bonne intégration ! 🎉**
