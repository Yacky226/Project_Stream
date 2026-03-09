# 🧪 Guide de Test - Chatbot Stream Éducatif

## Checklist de Tests Manuels

### ✅ Tests Basiques

#### 1. Ouverture/Fermeture
- [ ] Cliquer sur le bouton flottant ouvre le chatbot
- [ ] Le chatbot apparaît avec animation smooth
- [ ] L'icône du bouton change (MessageCircle → X)
- [ ] Cliquer à nouveau ferme le chatbot
- [ ] L'état est conservé après fermeture/réouverture

#### 2. Message de Bienvenue
- [ ] À l'ouverture, un message de bienvenue s'affiche
- [ ] Le message est contextualisé selon le rôle
- [ ] Badge "Assistant IA" visible
- [ ] Indicateur "En ligne" vert visible

#### 3. Envoi de Messages
- [ ] Taper du texte dans l'input fonctionne
- [ ] Enter envoie le message
- [ ] Shift+Enter crée une nouvelle ligne
- [ ] Le message apparaît à droite (utilisateur)
- [ ] L'input se vide après envoi
- [ ] Bouton send disabled si input vide

#### 4. Réponses du Chatbot
- [ ] Indicateur "typing" s'affiche
- [ ] Réponse apparaît après délai (500-1500ms)
- [ ] Réponse apparaît à gauche (assistant)
- [ ] Avatar du bot visible avec icône
- [ ] Horodatage affiché correctement

#### 5. Quick Actions
- [ ] Quick actions visibles au démarrage
- [ ] Boutons filtrés selon le rôle utilisateur
- [ ] Cliquer sur une action envoie le message
- [ ] Actions disparaissent après 2-3 messages

#### 6. Suggestions
- [ ] Suggestions affichées après certaines réponses
- [ ] Cliquer sur suggestion envoie le message
- [ ] Suggestions contextuelles au contenu

---

### 📱 Tests Responsive

#### Mobile (< 640px)
- [ ] Chatbot prend 90% de la largeur
- [ ] Hauteur messages adaptée (400px)
- [ ] Bouton flottant visible et accessible
- [ ] Scroll fonctionne correctement
- [ ] Texte lisible, pas de débordement
- [ ] Touch targets ≥ 44px

#### Tablet (640-1023px)
- [ ] Largeur fixe 400px
- [ ] Layout confortable
- [ ] Tous les éléments visibles
- [ ] Espacement approprié

#### Desktop (1024px+)
- [ ] Largeur fixe 440px
- [ ] Positionnement en bas à droite
- [ ] N'interfère pas avec le contenu
- [ ] Hover states visibles

---

### 🎯 Tests Fonctionnels

#### Navigation Automatique
- [ ] "catalogue" → redirige vers /catalog
- [ ] "dashboard" → redirige vers le bon dashboard
- [ ] "profil" → redirige vers /profile
- [ ] Délai de 1s avant redirection
- [ ] Message de confirmation affiché

#### Contexte par Rôle

**En tant qu'Étudiant:**
- [ ] "mes cours" → réponse pour étudiants
- [ ] "inscrire" → guide d'inscription
- [ ] "certificat" → info certificats
- [ ] Quick actions étudiants visibles

**En tant qu'Enseignant:**
- [ ] "créer cours" → guide création
- [ ] "session live" → guide streaming
- [ ] "étudiants" → accès gestion
- [ ] Quick actions enseignants visibles

**En tant qu'Admin:**
- [ ] Accès à toutes les fonctionnalités
- [ ] Pas de restrictions de contenu

#### Redémarrage de Session
- [ ] Bouton refresh visible dans le header
- [ ] Cliquer vide la conversation
- [ ] Nouveau message de bienvenue
- [ ] Ancienne session sauvegardée (Redux)

---

### ♿ Tests d'Accessibilité

#### Navigation Clavier
- [ ] Tab navigue entre les éléments
- [ ] Enter envoie le message
- [ ] Shift+Enter nouvelle ligne
- [ ] Focus visible sur tous les éléments
- [ ] Ordre logique de tabulation

#### Lecteurs d'Écran
- [ ] Bouton flottant a un aria-label
- [ ] Bouton fermer a un aria-label
- [ ] Bouton send a un aria-label
- [ ] Messages annoncés (aria-live)
- [ ] État typing communiqué

#### Contrastes
- [ ] Texte lisible (ratio ≥ 4.5:1)
- [ ] Couleurs suffisamment contrastées
- [ ] Pas de dépendance à la couleur seule
- [ ] Fonctionne en mode sombre

---

### 🎨 Tests Visuels

#### Animations
- [ ] Ouverture : slide-in-from-bottom + fade
- [ ] Messages : fade-in smooth
- [ ] Typing indicator : bounce animation
- [ ] Pulse sur bouton flottant
- [ ] Transitions de 300ms

#### Style
- [ ] Gradient header cohérent
- [ ] Border radius approprié
- [ ] Shadows correctes
- [ ] Espacement cohérent
- [ ] Police système utilisée

#### Dark Mode
- [ ] Fonctionne en mode sombre
- [ ] Contrastes suffisants
- [ ] Couleurs adaptées
- [ ] Pas de flashs visuels

---

### 💾 Tests d'État (Redux)

#### Redux Store
- [ ] État initial correct
- [ ] `isOpen` toggle fonctionne
- [ ] `currentSession` créée à l'ouverture
- [ ] Messages ajoutés correctement
- [ ] `isTyping` gère l'indicateur
- [ ] Sessions sauvegardées dans array

#### Persistance
- [ ] État conservé entre navigations
- [ ] Sessions multiples supportées
- [ ] Pas de perte de données

---

### 🔍 Tests Edge Cases

#### Cas Limites
- [ ] Message vide → bouton disabled
- [ ] Message très long → scroll fonctionne
- [ ] 100+ messages → performance OK
- [ ] Caractères spéciaux → affichés correctement
- [ ] Emojis → affichés correctement
- [ ] Code → formaté correctement

#### Erreurs
- [ ] Erreur service → message d'erreur gracieux
- [ ] Timeout → message approprié
- [ ] Pas de connexion → indication claire
- [ ] Redux erreur → fallback

#### Sécurité
- [ ] Pas d'injection XSS
- [ ] Entrées sanitized
- [ ] Pas de code exécuté
- [ ] URLs validées

---

## 🔬 Tests Automatisés (À Implémenter)

### Tests Unitaires

```typescript
// chatbotSlice.test.ts
describe('chatbotSlice', () => {
  it('should toggle chatbot', () => {
    const state = { isOpen: false };
    const newState = chatbotReducer(state, toggleChatbot());
    expect(newState.isOpen).toBe(true);
  });

  it('should add user message', () => {
    const state = { currentSession: { messages: [] } };
    const newState = chatbotReducer(state, addUserMessage('Hello'));
    expect(newState.currentSession.messages).toHaveLength(1);
    expect(newState.currentSession.messages[0].role).toBe('user');
  });

  it('should set typing indicator', () => {
    const state = { isTyping: false };
    const newState = chatbotReducer(state, setTyping(true));
    expect(newState.isTyping).toBe(true);
  });
});

// chatbotService.test.ts
describe('chatbotService', () => {
  it('should respond to greetings', () => {
    const response = generateChatbotResponse('Bonjour', {
      userRole: 'student',
      currentPage: '/dashboard'
    });
    expect(response.message).toContain('Bonjour');
  });

  it('should filter responses by role', () => {
    const response = generateChatbotResponse('créer cours', {
      userRole: 'teacher',
      currentPage: '/dashboard'
    });
    expect(response.message).toContain('créer');
  });

  it('should provide navigation actions', () => {
    const response = generateChatbotResponse('catalogue', {
      userRole: 'student',
      currentPage: '/dashboard'
    });
    expect(response.action).toBeDefined();
    expect(response.action.type).toBe('navigate');
  });
});
```

### Tests d'Intégration

```typescript
describe('Chatbot Integration', () => {
  it('should complete full message flow', async () => {
    const { getByPlaceholderText, getByText } = render(<Chatbot />);
    
    // Open chatbot
    fireEvent.click(getByTestId('chat-button'));
    
    // Send message
    const input = getByPlaceholderText('Posez votre question...');
    fireEvent.change(input, { target: { value: 'Aide' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Wait for response
    await waitFor(() => {
      expect(getByText(/Je peux vous aider/i)).toBeInTheDocument();
    });
  });

  it('should navigate when action is provided', async () => {
    const navigate = jest.fn();
    render(<Chatbot onNavigate={navigate} />);
    
    // Send navigation message
    // ... (similar to above)
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/catalog');
    });
  });
});
```

### Tests E2E (Playwright/Cypress)

```typescript
describe('Chatbot E2E', () => {
  it('should complete user journey', () => {
    // Login
    cy.login('student@example.com', 'password');
    
    // Open chatbot
    cy.get('[data-testid="chat-button"]').click();
    cy.get('[data-testid="chatbot"]').should('be.visible');
    
    // Send message
    cy.get('textarea').type('Mes cours{enter}');
    
    // Verify response
    cy.contains('Vous pouvez accéder').should('be.visible');
    
    // Click suggestion
    cy.contains('Voir mes cours').click();
    
    // Verify navigation
    cy.url().should('include', '/dashboard');
  });
});
```

---

## 📊 Métriques de Performance

### À Mesurer

```javascript
// Bundle size
const chatbotBundle = measureBundleSize();
console.log('Chatbot bundle:', chatbotBundle); // < 15KB

// First paint
performance.mark('chatbot-open-start');
// ... open chatbot
performance.mark('chatbot-open-end');
performance.measure('chatbot-open', 'chatbot-open-start', 'chatbot-open-end');
// < 50ms

// Response time
const start = Date.now();
await getChatbotResponse(message);
const duration = Date.now() - start;
// 500-1500ms

// Memory usage
const memoryBefore = performance.memory.usedJSHeapSize;
// ... use chatbot
const memoryAfter = performance.memory.usedJSHeapSize;
const memoryUsed = memoryAfter - memoryBefore;
// < 5MB for 100 messages
```

---

## 🐛 Bugs Connus

### À Tester Spécifiquement

1. **Scroll Auto**
   - [ ] Scroll vers le bas fonctionne toujours
   - [ ] Pas de jump visuel
   - [ ] Smooth sur tous les navigateurs

2. **Input Focus**
   - [ ] Focus après envoi de message
   - [ ] Focus après ouverture
   - [ ] Pas perdu entre actions

3. **Animations**
   - [ ] Pas de lag sur mobile
   - [ ] Transitions smooth
   - [ ] Pas de FOUC (Flash of Unstyled Content)

---

## ✅ Checklist de Release

### Avant de Déployer

- [ ] Tous les tests manuels passent
- [ ] Tests automatisés passent (quand implémentés)
- [ ] Performance optimale
- [ ] Accessibilité validée
- [ ] Responsive sur vrais devices
- [ ] Dark mode fonctionne
- [ ] Documentation à jour
- [ ] Console sans erreurs
- [ ] Redux DevTools sans warnings
- [ ] Build production sans erreurs

### Validation Finale

```bash
# Build production
npm run build

# Vérifier bundle size
npm run analyze

# Tests
npm run test
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 📝 Rapport de Bugs

### Template

```markdown
## Bug Description
[Description claire du bug]

## Steps to Reproduce
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

## Expected Behavior
[Ce qui devrait se passer]

## Actual Behavior
[Ce qui se passe réellement]

## Screenshots
[Si applicable]

## Environment
- Browser: [Chrome 120]
- OS: [Windows 11]
- Screen: [1920x1080]
- Role: [student/teacher/admin]

## Console Errors
[Erreurs dans la console]

## Additional Context
[Contexte additionnel]
```

---

## 🎓 Guide de Test Pour QA

### Scénarios Utilisateur

#### Scénario 1 : Étudiant Nouveau
```
1. Connectez-vous comme étudiant
2. Ouvrez le chatbot (devrait voir tooltip)
3. Lisez le message de bienvenue
4. Cliquez sur "Comment m'inscrire ?"
5. Vérifiez la réponse
6. Cliquez sur "Aller au catalogue"
7. Vérifiez la redirection
```

#### Scénario 2 : Enseignant Créant un Cours
```
1. Connectez-vous comme enseignant
2. Ouvrez le chatbot
3. Tapez "comment créer un cours"
4. Vérifiez la réponse détaillée
5. Cliquez sur "Créer un cours"
6. Vérifiez la navigation
```

#### Scénario 3 : Conversation Longue
```
1. Ouvrez le chatbot
2. Envoyez 10+ messages
3. Vérifiez le scroll
4. Vérifiez la performance
5. Redémarrez la conversation
6. Vérifiez que l'ancienne est sauvegardée
```

---

## 🔄 Cycle de Test

### Fréquence Recommandée

- **Après chaque modification** : Tests manuels basiques
- **Avant chaque commit** : Linting + type checking
- **Avant chaque PR** : Tests complets manuels
- **Avant chaque release** : Tous les tests + QA

### Outils Recommandés

- **Redux DevTools** - Debug état
- **React DevTools** - Inspecteur composants
- **Lighthouse** - Performance & Accessibilité
- **axe DevTools** - Accessibilité avancée
- **BrowserStack** - Tests multi-navigateurs

---

## 📚 Ressources

- [Testing Library](https://testing-library.com/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
- [Cypress](https://www.cypress.io/)
- [Web.dev Testing Guide](https://web.dev/testing/)

---

*Guide de test créé le 3 novembre 2025*
*Chatbot Stream Éducatif v1.0*
