# 📂 Fichiers à Vérifier - Stream Éducatif

## 🔍 Vérifications Nécessaires

### 1. Vérifier l'existence et le contenu de mockData.ts

**Fichier:** `/lib/mockData.ts`

**À vérifier:**
- [ ] Le fichier existe (✅ confirmé)
- [ ] Contient l'export `mockCourses`
- [ ] Types cohérents avec `types/course.ts`
- [ ] Données complètes pour les tests

**Action si mockCourses manque:**
```typescript
// Déplacer mockCourses depuis lib/auth.ts vers lib/mockData.ts
export const mockCourses: MockCourse[] = [
  {
    id: '1',
    title: 'Introduction to React',
    description: 'Learn the fundamentals of React',
    shortDescription: 'React basics',
    instructor: {
      id: 'inst-1',
      name: 'Sarah Johnson',
      avatar: undefined,
    },
    category: 'Programming',
    level: 'Débutant',
    duration: '8 heures',
    price: 49.99,
    rating: 4.8,
    studentsCount: 1250,
    reviewsCount: 320,
    tags: ['React', 'JavaScript', 'Frontend'],
    language: 'fr',
    hasLiveSession: true,
    isEnrolled: false,
    progress: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-10-20',
  },
  // ... autres cours
];
```

---

### 2. Vérifier les types dans /types/*

**Fichiers à vérifier:**

#### `/types/auth.ts`
- [ ] Export `User` avec tous les champs nécessaires
- [ ] Export `UserRole` = 'student' | 'teacher' | 'admin'
- [ ] Export `LoginCredentials`
- [ ] Export `RegisterData`
- [ ] Export `AuthResponse`

**Champs requis pour User:**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  phone?: string;
  preferences?: UserPreferences;
}
```

#### `/types/course.ts`
- [ ] Export `Course` aligné avec `MockCourse` de mockData
- [ ] Export `CourseLevel`
- [ ] Export `CourseCategory`

**Structure minimale:**
```typescript
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  price: number;
  rating: number;
  studentsCount: number;
  reviewsCount: number;
  thumbnail?: string;
  tags: string[];
  language: 'fr' | 'en';
  hasLiveSession: boolean;
  isEnrolled?: boolean;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}
```

#### `/types/user.ts`
- [ ] Vérifier cohérence avec User dans auth.ts
- [ ] Pas de duplication de type

---

### 3. Vérifier les fichiers de traduction dans i18n

**Fichier:** `/lib/i18n.ts`

**Structure actuelle à vérifier:**

```typescript
// Vérifier que le fichier contient:
const translations = {
  fr: {
    // Traductions françaises
  },
  en: {
    // Traductions anglaises
  }
};

export function useTranslation() {
  const getCurrentLanguage = () => {
    // ...
  };
  
  const t = (key: string) => {
    // ...
  };
  
  return { t, getCurrentLanguage };
}
```

**Clés minimales requises:**
```typescript
const translations = {
  fr: {
    app: {
      name: 'Stream Éducatif',
    },
    nav: {
      home: 'Accueil',
      catalog: 'Catalogue',
      liveSessions: 'Sessions Live',
      teacherDashboard: 'Dashboard Enseignant',
      mySessions: 'Mes Sessions',
      admin: 'Administration',
      dashboard: 'Tableau de bord',
      profile: 'Mon Profil',
      settings: 'Paramètres',
      search: 'Rechercher',
    },
    roles: {
      student: 'Étudiant',
      teacher: 'Enseignant',
      admin: 'Administrateur',
    },
    auth: {
      signin: 'Connexion',
      signup: 'Inscription',
      signout: 'Se déconnecter',
    },
  },
  en: {
    // Équivalents anglais
  },
};
```

---

### 4. Vérifier authStorage dans localStorage

**Fichier:** `/lib/localStorage.ts`

**À vérifier:**
- [ ] Export `authStorage` avec méthodes:
  - `saveAuthData(data)`
  - `loadAuthData()`
  - `clearAuthData()`
- [ ] Clés cohérentes: `auth_user`, `auth_token`, `auth_refreshToken`
- [ ] Gestion des erreurs JSON.parse

**Exemple attendu:**
```typescript
export const authStorage = {
  saveAuthData: (data: { user: User; token: string; refreshToken?: string }) => {
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    localStorage.setItem('auth_token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('auth_refreshToken', data.refreshToken);
    }
  },
  
  loadAuthData: () => {
    try {
      const userStr = localStorage.getItem('auth_user');
      const token = localStorage.getItem('auth_token');
      const refreshToken = localStorage.getItem('auth_refreshToken');
      
      if (!userStr || !token) return null;
      
      return {
        user: JSON.parse(userStr),
        token,
        refreshToken: refreshToken || undefined,
      };
    } catch (error) {
      console.error('Failed to load auth data:', error);
      return null;
    }
  },
  
  clearAuthData: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refreshToken');
  },
};
```

---

### 5. Vérifier les composants de pages manquants

**Vérifier que ces fichiers existent et sont fonctionnels:**

#### Pages principales
- [ ] `/components/pages/HomePage.tsx`
- [ ] `/components/pages/StudentDashboard.tsx`
- [ ] `/components/pages/TeacherDashboard.tsx`
- [ ] `/components/pages/AdminDashboard.tsx`
- [ ] `/components/pages/AuthPageRedux.tsx`
- [ ] `/components/pages/ProfilePage.tsx`
- [ ] `/components/pages/SettingsPage.tsx`

#### Pages de cours
- [ ] `/components/pages/CourseCatalog.tsx`
- [ ] `/components/pages/CourseDetail.tsx`
- [ ] `/components/pages/ProgrammingCoursesPage.tsx`
- [ ] `/components/pages/DesignCoursesPage.tsx`
- [ ] `/components/pages/MarketingCoursesPage.tsx`
- [ ] `/components/pages/BeginnerCoursesPage.tsx`

#### Pages live
- [ ] `/components/pages/LiveSession.tsx`
- [ ] `/components/pages/LiveSessionsPage.tsx`
- [ ] `/components/pages/LiveStreamingDemoPage.tsx`

#### Pages statiques
- [ ] `/components/pages/ContactPage.tsx`
- [ ] `/components/pages/FAQPage.tsx`
- [ ] `/components/pages/HelpPage.tsx`
- [ ] `/components/pages/TermsPage.tsx`
- [ ] `/components/pages/PrivacyPage.tsx`
- [ ] `/components/pages/AccessibilityPage.tsx`
- [ ] `/components/pages/BlogPage.tsx`
- [ ] `/components/pages/BusinessPage.tsx`
- [ ] `/components/pages/CareersPage.tsx`
- [ ] `/components/pages/MobileAppPage.tsx`

#### Autres
- [ ] `/components/pages/SearchPage.tsx`
- [ ] `/components/pages/TeacherProfile.tsx`
- [ ] `/components/pages/TeacherSignupPage.tsx`
- [ ] `/components/pages/NotFoundPage.tsx`

---

### 6. Vérifier les composants Live Streaming

**Fichiers à vérifier:**

- [ ] `/components/live/SimpleLiveComponents.tsx`
  - Export `SimpleLiveStudio`
  - Export `SimpleLiveViewer`
  - Export `SimpleLiveManager`

- [ ] `/components/live/AdvancedLiveSession.tsx`
  - Export `AdvancedLiveSession`
  - Props: `courseId`, `sessionId`, `userRole`

- [ ] `/components/live/QuickLiveActions.tsx`
  - Export `QuickLiveActions`

- [ ] `/components/live/StreamingServiceProvider.tsx`
  - Export `StreamingServiceProvider`
  - Export `StreamingDebugPanel`

---

### 7. Vérifier le fichier lib/auth.ts (ancien système)

**Fichier:** `/lib/auth.ts`

**Actions:**
1. [ ] Identifier ce qui est encore utilisé
2. [ ] Vérifier si `mockCourses` est exporté ici
3. [ ] Planifier la migration/suppression

**Éléments à migrer:**
- `mockCourses` → vers `lib/mockData.ts`
- Types `User`, `Course`, etc. → vers `/types/*`
- Fonctions d'auth → déjà migrées vers `hooks/useAuth.ts`

**Ce qui peut être supprimé après migration:**
- Anciennes fonctions `useAuth()`, `login()`, `logout()`
- Définitions de types redondantes

---

### 8. Vérifier la configuration Redux

**Fichier:** `/store/index.ts`

**À vérifier:**
- [ ] Configuration du store
- [ ] Middleware correctement configuré
- [ ] RTK Query API slices enregistrés
- [ ] Reducers correctement combinés

**Structure attendue:**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import coursesReducer from './slices/coursesSlice';
import streamingReducer from './slices/streamingSlice';
import notificationsReducer from './slices/notificationsSlice';
import chatReducer from './slices/chatSlice';
import { authApi } from './api/authApi';
import { coursesApi } from './api/coursesApi';
import { streamingApi } from './api/streamingApi';
import { userApi } from './api/userApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    courses: coursesReducer,
    streaming: streamingReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    [authApi.reducerPath]: authApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [streamingApi.reducerPath]: streamingApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(coursesApi.middleware)
      .concat(streamingApi.middleware)
      .concat(userApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### 9. Vérifier les hooks Redux

**Fichier:** `/hooks/redux.ts`

**À vérifier:**
- [ ] Export `useAppDispatch`
- [ ] Export `useAppSelector`
- [ ] Types correctement définis

**Structure attendue:**
```typescript
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

### 10. Vérifier configUtils

**Fichier:** `/lib/config.ts`

**À vérifier:**
- [ ] Export `configUtils`
- [ ] Méthodes: `log()`, `debug()`, `warn()`, `error()`
- [ ] Méthode: `isDevelopment()`
- [ ] Respect de l'environnement (production vs development)

**Exemple attendu:**
```typescript
export const configUtils = {
  isDevelopment: () => {
    return process.env.NODE_ENV === 'development';
  },
  
  log: (...args: any[]) => {
    if (configUtils.isDevelopment()) {
      console.log('[LOG]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (configUtils.isDevelopment()) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
```

---

## 📝 CHECKLIST DE VÉRIFICATION COMPLÈTE

### Fichiers Critiques
- [ ] `/lib/mockData.ts` - Contient mockCourses
- [ ] `/lib/localStorage.ts` - authStorage fonctionnel
- [ ] `/lib/i18n.ts` - Traductions FR/EN complètes
- [ ] `/lib/config.ts` - configUtils disponible
- [ ] `/lib/auth.ts` - À migrer/nettoyer

### Types
- [ ] `/types/auth.ts` - User, UserRole, etc.
- [ ] `/types/course.ts` - Course cohérent
- [ ] `/types/user.ts` - Pas de duplication

### Redux
- [ ] `/store/index.ts` - Store configuré
- [ ] `/hooks/redux.ts` - Hooks disponibles
- [ ] `/hooks/useAuth.ts` - Hook d'auth Redux

### Composants Pages (30 fichiers)
- [ ] Tous les fichiers listés dans section 5 existent
- [ ] Acceptent tous la prop `onNavigate`
- [ ] Importent correctement les types et hooks

### Composants Live (4+ fichiers)
- [ ] SimpleLiveComponents exports corrects
- [ ] AdvancedLiveSession fonctionnel
- [ ] StreamingServiceProvider wrapper correct

### Styles
- [ ] `/styles/globals.css` - Tokens définis
- [ ] Dark mode fonctionne
- [ ] Fallbacks CSS en place

---

## 🎯 ACTIONS POST-VÉRIFICATION

Après avoir vérifié tous ces fichiers:

1. **Si des fichiers manquent:**
   - Les créer selon les templates fournis
   - Ou signaler qu'ils doivent être implémentés

2. **Si des incohérences sont trouvées:**
   - Documenter dans un rapport
   - Prioriser les corrections

3. **Si tout est OK:**
   - Procéder aux corrections prioritaires
   - Exécuter la checklist de CORRECTIONS_PRIORITAIRES.md

---

*Document généré le 2 novembre 2025*
