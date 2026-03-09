# Architecture de Stream Éducatif

## Vue d'ensemble

Stream Éducatif est une plateforme de streaming éducatif construite avec React, TypeScript, Redux Toolkit et Tailwind CSS. L'architecture est conçue pour être modulaire, scalable et faciliter le développement avec des données mock avant l'intégration backend.

## Structure du projet

```
├── components/           # Composants React réutilisables
│   ├── debug/           # Outils de développement et debug
│   ├── demo/            # Composants de démonstration
│   ├── layout/          # Composants de mise en page
│   ├── live/            # Composants de streaming live
│   ├── pages/           # Pages de l'application
│   ├── providers/       # Providers React (Redux, etc.)
│   ├── ui/              # Composants UI de base (ShadCN)
│   └── video/           # Composants vidéo
├── hooks/               # Hooks React personnalisés
├── lib/                 # Bibliothèques et utilitaires
├── store/               # État global Redux
│   ├── api/             # APIs RTK Query
│   ├── middleware/      # Middleware Redux
│   └── slices/          # Slices Redux
├── styles/              # Fichiers CSS
├── types/               # Définitions TypeScript
└── utils/               # Utilitaires divers
```

## Gestion de l'état

### Redux Toolkit
- **Store centralisé** pour l'état global de l'application
- **RTK Query** pour la gestion des API et mise en cache
- **Middleware personnalisés** pour l'authentification et la gestion d'erreurs

### Slices Redux
- `authSlice`: Authentification et gestion utilisateur
- `userSlice`: Données du profil utilisateur
- `coursesSlice`: Gestion des cours
- `streamingSlice`: État des sessions de streaming
- `chatSlice`: Messages et état du chat
- `notificationsSlice`: Notifications système
- `uiSlice`: État de l'interface utilisateur

## Système de routage

### Routes dynamiques
Le système de routage utilise un matcher intelligent qui support :
- Routes statiques (`/`, `/catalog`, `/dashboard`)
- Routes dynamiques (`/courses/:id`, `/teacher/live/:courseId/:sessionId`)
- Routes protégées avec authentification
- Contrôle d'accès basé sur les rôles

### Configuration des routes
```typescript
// lib/routes.tsx
export const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: StudentDashboard,
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Tableau de bord étudiant'
  }
];
```

## Gestion des données

### Mode hybride Mock/Backend
L'application supporte deux modes de fonctionnement :

#### Mode Mock (Développement)
- Utilise des données simulées (mockData.ts)
- Permet le développement sans backend
- Simule les délais et réponses d'API réelles

#### Mode Backend (Production)
- Se connecte au backend Spring Boot
- Utilise les APIs RTK Query pour les requêtes
- Basculement transparent depuis les mocks

### Hook useData
```typescript
const { getCourses, getUsers, dataMode } = useData();

// Récupère automatiquement depuis mock ou API réelle
const courses = await getCourses({ category: 'programming' });
```

## Configuration centralisée

### lib/config.ts
Configuration centralisée pour :
- URLs d'API et WebSocket
- Paramètres d'environnement
- Feature flags
- Paramètres WebRTC

### lib/appService.ts
Service principal pour :
- Initialisation de l'application
- Gestion des services
- Diagnostics et monitoring
- Basculement mock/backend

## Streaming en temps réel

### Architecture WebRTC
- Support pour streaming vidéo/audio
- Chat en temps réel
- Signalisation via WebSocket
- Gestion des participants

### Composants de streaming
- `SimpleLiveStudio`: Interface simple pour enseignants
- `AdvancedLiveSession`: Interface avancée avec contrôles étendus
- `LiveChatManager`: Gestion du chat en direct
- `StreamingServiceProvider`: Provider pour les services de streaming

## Internationalisation

### Système i18n
- Support français/anglais
- Format ICU MessageFormat
- Détection automatique de la langue
- Gestion des fuseaux horaires

## Thèmes et styles

### Tailwind CSS v4
- Tokens de design cohérents
- Mode sombre/clair
- Variables CSS personnalisées
- Composants ShadCN intégrés

### Système de thèmes
```css
:root {
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --primary: #030213;
  /* ... autres tokens */
}

.dark {
  --background: oklch(0.08 0 0);
  --foreground: oklch(0.98 0 0);
  /* ... tokens mode sombre */
}
```

## Développement et debugging

### Outils de développement
- **ReduxDebug**: État Redux en temps réel
- **DataModeIndicator**: Indicateur du mode de données
- **StreamingDebugPanel**: Diagnostics des connexions

### Basculement de mode
```typescript
// En mode développement
appUtils.toggleDataMode(); // Bascule entre mock et backend
appUtils.diagnose();       // Lance un diagnostic complet
```

## Middleware et gestion d'erreurs

### Middleware d'authentification
- Gestion automatique des tokens expirés
- Nettoyage de l'état lors de la déconnexion
- Redirection intelligente après login

### Gestion d'erreurs
- Middleware de logging centralisé
- Error boundaries React
- Notifications d'erreur utilisateur

## APIs et intégration backend

### RTK Query APIs
- `authApi`: Authentification et gestion des sessions
- `coursesApi`: CRUD des cours
- `streamingApi`: APIs de streaming
- `userApi`: Gestion des profils utilisateur

### Intégration Spring Boot
- Support pour les endpoints REST
- WebSocket pour temps réel
- Gestion des erreurs HTTP standardisée

## Sécurité

### Authentification
- JWT tokens avec refresh automatique
- Stockage sécurisé des tokens
- Validation côté client et serveur

### Autorisations
- Contrôle d'accès basé sur les rôles
- Routes protégées
- Permissions granulaires

## Performance

### Optimisations
- Lazy loading des composants
- Mise en cache RTK Query
- Suspense pour le chargement
- Images optimisées avec fallback

### Monitoring
- Diagnostics de performance
- Métriques de connexion WebRTC
- Logs de développement

## Accessibilité

### Conformité WCAG AA
- Navigation au clavier
- Lecteurs d'écran
- Contrastes de couleur
- Focus management

## Déploiement

### Environnements
- **Development**: Mock data, debug activé
- **Test**: Environnement de test avec backend
- **Production**: Backend complet, optimisations activées

### Configuration d'environnement
```typescript
// Variables d'environnement supportées
REACT_APP_BACKEND_URL
REACT_APP_WEBSOCKET_URL
REACT_APP_ENVIRONMENT
```

## Prochaines étapes

### Intégration backend
1. Connecter le backend Spring Boot
2. Configurer les variables d'environnement
3. Tester les APIs avec `appUtils.diagnose()`
4. Basculer vers le mode backend avec `appUtils.toggleDataMode()`

### Monitoring
- Intégrer des métriques de performance
- Ajouter des alertes de santé
- Surveiller les connexions WebRTC

Cette architecture garantit une séparation claire des responsabilités, une maintenabilité élevée et une évolutivité pour les futures fonctionnalités.