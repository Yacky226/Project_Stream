# Guide d'utilisation Redux Toolkit - Stream Éducatif

## 🏗️ Architecture Redux

L'application utilise Redux Toolkit avec une architecture modulaire et scalable.

### Structure du Store

```
/store/
  ├── index.ts              # Configuration du store principal
  ├── slices/               # Slices Redux pour chaque domaine
  │   ├── authSlice.ts      # Authentification
  │   ├── userSlice.ts      # Utilisateur et profil
  │   ├── coursesSlice.ts   # Cours et apprentissage
  │   ├── streamingSlice.ts # Sessions live
  │   ├── chatSlice.ts      # Chat en temps réel
  │   ├── uiSlice.ts        # Interface utilisateur
  │   └── notificationsSlice.ts # Notifications
  ├── api/                  # Services API avec RTK Query
  │   ├── apiService.ts     # Configuration de base
  │   ├── authApi.ts        # API d'authentification
  │   ├── userApi.ts        # API utilisateur
  │   ├── coursesApi.ts     # API des cours
  │   └── streamingApi.ts   # API streaming
  └── middleware/           # Middleware personnalisés
      ├── authMiddleware.ts # Gestion auth automatique
      ├── errorMiddleware.ts # Gestion d'erreurs
      └── loggingMiddleware.ts # Logs et monitoring
```

## 🚀 Utilisation de Base

### 1. Hooks Redux

```typescript
import { useAppDispatch, useAppSelector } from '../hooks/redux';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(state => state.auth);
  
  // Utilisation...
}
```

### 2. Hook d'Authentification

```typescript
import { useAuth } from '../hooks/useAuth';

function AuthComponent() {
  const { user, login, logout, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login({ email, password });
      // Succès
    } catch (error) {
      // Erreur gérée automatiquement
    }
  };
}
```

### 3. RTK Query pour les API

```typescript
import { useGetCoursesQuery, useEnrollCourseMutation } from '../store/api/coursesApi';

function CoursesComponent() {
  const { data: courses, isLoading, error } = useGetCoursesQuery({
    page: 1,
    category: 'programming'
  });
  
  const [enrollCourse, { isLoading: enrolling }] = useEnrollCourseMutation();
  
  const handleEnroll = async (courseId: string) => {
    try {
      await enrollCourse({ courseId }).unwrap();
      // Succès
    } catch (error) {
      // Erreur
    }
  };
}
```

## 📦 Slices Disponibles

### AuthSlice
- **État** : user, token, isAuthenticated, isLoading, error
- **Actions** : loginUser, logoutUser, registerUser, refreshToken
- **Fonctionnalités** : Auto-refresh, blocage temporaire, validation

### UserSlice
- **État** : profile, preferences, stats, enrolledCourses, favorites
- **Actions** : fetchUserProfile, updateProfile, enrollInCourse
- **Fonctionnalités** : Synchronisation automatique, cache local

### StreamingSlice
- **État** : currentSession, participants, handRaises, mediaState
- **Actions** : createSession, joinSession, raiseHand, toggleVideo
- **Fonctionnalités** : WebRTC, contrôles média, gestion participants

### UISlice
- **État** : theme, language, sidebar, notifications, modal
- **Actions** : setTheme, toggleSidebar, showModal, addToast
- **Fonctionnalités** : Thème automatique, responsive design

## 🔄 Actions Asynchrones

### Créer une action async

```typescript
export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userApi.endpoints.getProfile.initiate(userId).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

### Gérer les états dans le slice

```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchUserData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchUserData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
    })
    .addCase(fetchUserData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
}
```

## 🌐 RTK Query

### Définir un endpoint

```typescript
export const coursesApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<CoursesResponse, CoursesParams>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),
    
    updateCourse: builder.mutation<Course, UpdateCourseData>({
      query: (data) => ({
        url: `/courses/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),
  }),
});
```

### Mode Développement

En mode développement, les APIs utilisent des mocks :

```typescript
queryFn: async (params, api, extraOptions, baseQuery) => {
  if (process.env.NODE_ENV === 'development') {
    // Mock response
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockData };
  }
  
  // Production API call
  return baseQuery({ url: '/api/endpoint', params }, api, extraOptions);
}
```

## 🛠️ Middleware

### Auth Middleware
- Auto-refresh des tokens
- Redirection automatique sur 401
- Gestion des erreurs d'authentification

### Error Middleware
- Traitement intelligent des erreurs
- Affichage automatique des toasts
- Retry automatique pour les erreurs réseau

### Logging Middleware
- Logs détaillés en développement
- Monitoring des performances
- Tracking des erreurs

## 💾 Persistance

La persistance est gérée via localStorage :

```typescript
// Sauvegarde automatique
store.subscribe(() => {
  const state = store.getState();
  
  if (state.auth.isAuthenticated) {
    authStorage.saveAuthData({
      token: state.auth.token,
      user: state.auth.user
    });
  }
});

// Chargement au démarrage
const savedAuth = authStorage.loadAuthData();
if (savedAuth) {
  store.dispatch(setInitialState(savedAuth));
}
```

## 🎯 Bonnes Pratiques

### 1. Structure des Actions

```typescript
// ✅ Bon
const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>, { rejectWithValue }) => {
    // ...
  }
);

// ❌ Éviter
const updateUser = createAsyncThunk('update', async (data) => {
  // Nom trop générique, pas de gestion d'erreur
});
```

### 2. Sélecteurs

```typescript
// ✅ Utiliser des sélecteurs
const selectCurrentUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// Dans le composant
const user = useAppSelector(selectCurrentUser);
```

### 3. Types TypeScript

```typescript
// ✅ Types stricts
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// ✅ Actions typées
const login = (credentials: LoginCredentials) => {
  return dispatch(loginUser(credentials));
};
```

### 4. Gestion d'Erreurs

```typescript
// ✅ Gestion complète
try {
  await dispatch(loginUser(credentials)).unwrap();
  navigate('/dashboard');
} catch (error) {
  // L'erreur est déjà dans le store, 
  // pas besoin de la gérer manuellement
}
```

## 🔍 Debug

### Redux DevTools

Les DevTools Redux sont activés en développement pour :
- Inspecter l'état
- Voir les actions
- Time-travel debugging

### Composant Debug

```typescript
import { ReduxDebug } from '../components/debug/ReduxDebug';

// Affiche l'état Redux en bas à droite en mode dev
<ReduxDebug />
```

### Console Logs

En développement, tous les actions et changements d'état sont loggés :

```
[2024-01-20T10:30:15.123Z] auth/loginUser/pending
[2024-01-20T10:30:15.456Z] auth/loginUser/fulfilled
```

## 🚀 Déploiement

### Variables d'Environnement

```typescript
// Mode développement : mocks activés
if (process.env.NODE_ENV === 'development') {
  // Utiliser les mocks
}

// Production : vraies APIs
const baseUrl = process.env.NODE_ENV === 'production' 
  ? '/api/v1' 
  : 'http://localhost:8080/api/v1';
```

### Optimisations

- **Code splitting** : Les slices sont lazy-loaded
- **Cache RTK Query** : Cache intelligent des requêtes
- **Sérialisation** : Optimisée pour les performances
- **DevTools** : Désactivés en production

## 📚 Ressources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Guide](https://redux-toolkit.js.org/rtk-query/overview)
- [TypeScript with Redux](https://redux-toolkit.js.org/usage/usage-with-typescript)

---

## 🎯 Exemples Complets

Voir les composants exemples :
- `/components/layout/HeaderRedux.tsx` - Header avec Redux
- `/components/pages/AuthPageRedux.tsx` - Authentification complète
- `/components/debug/ReduxDebug.tsx` - Debug en développement