# 🚀 Chatbot - Guide de Démarrage Rapide

## ✅ Le chatbot est déjà configuré !

Tous les fichiers ont été créés et intégrés automatiquement. Le chatbot est **prêt à fonctionner** immédiatement.

---

## 📦 Ce qui a été créé

### 1. Types et Interfaces (`/types/chatbot.ts`)
- Définitions TypeScript pour les messages, sessions, et état
- Types pour les réponses et actions

### 2. Redux Slice (`/store/slices/chatbotSlice.ts`)
- Gestion de l'état du chatbot
- Actions pour ouvrir/fermer, envoyer des messages
- Historique des sessions

### 3. Service Intelligent (`/lib/chatbotService.ts`)
- Base de connaissances complète
- Réponses contextuelles selon le rôle
- Navigation automatique
- Suggestions intelligentes

### 4. Composants UI (`/components/chatbot/`)
- **Chatbot.tsx** - Interface principale
- **ChatMessage.tsx** - Affichage des messages avec animations
- **ChatInput.tsx** - Input avec support Shift+Enter
- **ChatButton.tsx** - Bouton flottant avec badge

### 5. Intégration App
- Automatiquement ajouté dans `App.tsx`
- Visible seulement pour les utilisateurs connectés
- Accessible depuis toutes les pages

---

## 🎯 Comment l'utiliser

### Pour tester immédiatement :

1. **Connectez-vous** à l'application (n'importe quel compte)
2. Vous verrez un **bouton violet** en bas à droite avec une icône de message
3. **Cliquez** sur le bouton pour ouvrir le chatbot
4. **Tapez** une question ou cliquez sur une suggestion
5. Le chatbot répond automatiquement !

### Exemples de questions à essayer :

#### Pour les Étudiants :
- "Comment m'inscrire à un cours ?"
- "Où sont mes cours ?"
- "Comment rejoindre une session live ?"
- "Comment obtenir mon certificat ?"

#### Pour les Enseignants :
- "Comment créer un cours ?"
- "Comment planifier une session live ?"
- "Où voir mes étudiants ?"
- "Comment voir mes statistiques ?"

#### Questions Générales :
- "Aller au catalogue"
- "Mon dashboard"
- "Mon profil"
- "Aide"

---

## 🎨 Ce que vous voyez

### Interface Chatbot

```
┌─────────────────────────────────────┐
│  🤖 Assistant virtuel        🔄 ✕  │ ← Header gradient
│  ● En ligne                         │
├─────────────────────────────────────┤
│                                     │
│  🤖  Bonjour ! Je suis votre       │ ← Message assistant
│      assistant virtuel...           │
│                              14:30  │
│                                     │
│  👤  Comment créer un cours ?      │ ← Message utilisateur
│                              14:31  │
│                                     │
│  🤖  Pour créer un nouveau cours:  │ ← Réponse
│      1. Allez sur votre...         │
│                              14:31  │
│                                     │
│  [Créer un cours] [Mes cours]      │ ← Suggestions
│                                     │
├─────────────────────────────────────┤
│  [Posez votre question...    ] 📤  │ ← Input
│  Appuyez sur Entrée pour envoyer   │
└─────────────────────────────────────┘
```

---

## 🛠️ Configuration Personnalisée

### Ajouter une Nouvelle Réponse

**Fichier:** `/lib/chatbotService.ts`

```typescript
const knowledgeBase = {
  student: {
    // Ajoutez votre nouveau sujet ici
    nomDuSujet: {
      keywords: ['mot-clé1', 'mot-clé2', 'mot-clé3'],
      response: `Votre réponse complète ici...
      
Vous pouvez utiliser plusieurs lignes,
des listes, et des instructions.`
    }
  }
};
```

### Ajouter une Quick Action

**Fichier:** `/store/slices/chatbotSlice.ts`

```typescript
quickActions: [
  // Ajoutez votre action ici
  { 
    id: '7', 
    label: 'Votre nouveau bouton', 
    action: 'votre_action',
    roles: ['student', 'teacher'] // Optionnel
  },
]
```

### Changer les Couleurs

**Fichier:** `/components/chatbot/Chatbot.tsx`

```tsx
// Header gradient (ligne ~85)
className="bg-gradient-to-r from-blue-500 to-purple-600"
// Changez en :
className="bg-gradient-to-r from-green-500 to-teal-600"

// Bouton flottant (dans ChatButton.tsx)
className="bg-gradient-to-br from-blue-500 to-purple-600"
```

---

## 📱 Responsive

Le chatbot s'adapte automatiquement :

- **Mobile** : Largeur 90%, hauteur optimisée
- **Tablet** : 400px de large
- **Desktop** : 440px de large

Testez sur différents appareils pour voir l'adaptation !

---

## 🔥 Fonctionnalités Avancées

### Navigation Automatique

Le chatbot peut naviguer automatiquement :

```typescript
// Exemple dans chatbotService.ts
if (normalizedMessage.includes('catalogue')) {
  return {
    message: `Je vous redirige vers le catalogue...`,
    action: {
      type: 'navigate',
      payload: '/catalog'
    }
  };
}
```

### Réponses Contextuelles

Les réponses s'adaptent au rôle :

```typescript
const response = generateChatbotResponse(message, {
  userRole: user.role,        // 'student' | 'teacher' | 'admin'
  currentPage: currentPath,    // Page actuelle
  userName: user.firstName     // Nom de l'utilisateur
});
```

---

## 🎓 Étendre avec une IA

### Option 1 : OpenAI

```bash
npm install openai
```

```typescript
// Dans chatbotService.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getChatbotResponseWithAI(message: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Tu es un assistant pour Stream Éducatif" },
      { role: "user", content: message }
    ]
  });
  
  return completion.choices[0].message.content;
}
```

### Option 2 : Claude (Anthropic)

```bash
npm install @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
```

---

## 🐛 Dépannage

### Le chatbot ne s'ouvre pas

1. ✅ Vérifiez que vous êtes connecté
2. ✅ Vérifiez la console pour les erreurs
3. ✅ Redux DevTools → state.chatbot.isOpen

### Les messages ne s'envoient pas

1. ✅ Vérifiez que l'input n'est pas disabled
2. ✅ Regardez les logs console
3. ✅ Vérifiez chatbotService.ts

### Le bouton n'est pas visible

1. ✅ Vérifiez isAuthenticated dans Redux
2. ✅ Regardez le z-index (doit être 40-50)
3. ✅ Vérifiez les styles CSS

---

## 📊 Monitoring

### Redux DevTools

Ouvrez Redux DevTools et regardez :

```
State → chatbot
  ├── isOpen: true/false
  ├── currentSession
  │   ├── messages: []
  │   └── context
  └── isTyping: true/false
```

### Console Logs

En mode développement, vous verrez :

```
[Chatbot] User message: "Comment créer un cours ?"
[Chatbot] Context: { userRole: 'teacher', ... }
[Chatbot] Response: { message: "...", suggestions: [...] }
```

---

## ✨ Prochaines Étapes

### Immédiat
1. ✅ Testez le chatbot
2. ✅ Essayez différentes questions
3. ✅ Vérifiez sur mobile

### Court Terme
- [ ] Personnalisez les réponses
- [ ] Ajoutez vos propres quick actions
- [ ] Changez les couleurs si besoin

### Moyen Terme
- [ ] Intégrez une vraie IA (OpenAI/Claude)
- [ ] Ajoutez persistance backend
- [ ] Créez des analytics

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **CHATBOT_DOCUMENTATION.md** - Documentation complète (tous les détails)
- **Code source** - Les fichiers sont bien commentés
- **Redux DevTools** - Pour voir l'état en temps réel

---

## 🎉 C'est Tout !

Le chatbot est **100% fonctionnel** et prêt à l'emploi.

**Testez-le maintenant :**
1. Connectez-vous à l'application
2. Cliquez sur le bouton violet
3. Posez une question !

**Le chatbot vous répondra immédiatement avec des suggestions contextuelles.**

---

## 💬 Support

Questions ? Problèmes ?

1. Consultez **CHATBOT_DOCUMENTATION.md**
2. Vérifiez la console browser
3. Utilisez Redux DevTools
4. Contactez l'équipe dev

---

*Guide créé le 3 novembre 2025*
*Chatbot Stream Éducatif v1.0*

**Bon chatbot ! 🚀**
