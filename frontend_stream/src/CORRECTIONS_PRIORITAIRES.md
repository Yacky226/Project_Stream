# 🔧 Corrections Prioritaires - Stream Éducatif

## 📌 Actions Immédiates Requises

### 🔴 CORRECTION #1: Migrer les imports d'authentification (CRITIQUE)

**Problème:** 10+ fichiers utilisent encore l'ancien système `lib/auth` au lieu du nouveau système Redux

**Fichiers à corriger:**

#### 1. `/components/pages/StudentDashboard.tsx`
```typescript
// ❌ LIGNE 8 - À REMPLACER
import { useAuth, mockCourses, type Course, type User } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
import type { Course } from '../../types/course';
import type { User } from '../../types/user';
// mockCourses devra venir de mockData une fois créé
```

#### 2. `/components/pages/HomePage.tsx`
```typescript
// ❌ LIGNE 6 - À REMPLACER
import { useAuth, mockCourses, type Course } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
import type { Course } from '../../types/course';
// mockCourses devra venir de mockData
```

#### 3. `/components/pages/CourseDetail.tsx`
```typescript
// ❌ LIGNE 10 - À REMPLACER
import { useAuth, mockCourses, type Course, type User } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
import type { Course } from '../../types/course';
import type { User } from '../../types/user';
```

#### 4. `/components/pages/CourseCatalog.tsx`
```typescript
// ❌ LIGNE 8 - À REMPLACER
import { mockCourses, type Course } from '../../lib/auth';

// ✅ CORRECTION
import type { Course } from '../../types/course';
// mockCourses devra venir de mockData
```

#### 5. `/components/pages/ProfilePage.tsx`
```typescript
// ❌ LIGNE 3 - À REMPLACER
import { useAuth } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
```

#### 6. `/components/pages/AuthPage.tsx`
```typescript
// ❌ LIGNE 9 - À REMPLACER
import { useAuth, type UserRole } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';
```

#### 7. `/components/pages/ProgrammingCoursesPage.tsx`
```typescript
// ❌ LIGNE 8 - À REMPLACER
import { mockCourses } from '../../lib/auth';

// ✅ CORRECTION
// mockCourses devra venir de mockData
```

#### 8. `/components/pages/DesignCoursesPage.tsx`
```typescript
// ❌ LIGNE 8 - À REMPLACER
import { mockCourses } from '../../lib/auth';

// ✅ CORRECTION
// mockCourses devra venir de mockData
```

#### 9. `/components/pages/MarketingCoursesPage.tsx`
```typescript
// ❌ LIGNE 8 - À REMPLACER
import { mockCourses } from '../../lib/auth';

// ✅ CORRECTION
// mockCourses devra venir de mockData
```

#### 10. `/components/layout/Header.tsx`
```typescript
// ❌ LIGNE 7 - À REMPLACER
import { useAuth, type User } from '../../lib/auth';

// ✅ CORRECTION
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/user';
```

---

### 🔴 CORRECTION #2: Exporter mockCourses depuis mockData

**Action:** Ajouter l'export de mockCourses dans `/lib/mockData.ts`

**Vérifier que le fichier contient:**
```typescript
export const mockCourses: MockCourse[] = [
  // ... données de cours
];
```

**Si mockCourses n'est pas défini dans mockData.ts, il faut:**
1. Le déplacer depuis `lib/auth.ts` vers `lib/mockData.ts`
2. Renommer le type vers `MockCourse` pour cohérence
3. Aligner avec le type `Course` de `types/course.ts`

---

### 🔴 CORRECTION #3: Ajouter aria-label aux boutons d'icônes

**Fichier:** `/components/layout/HeaderRedux.tsx`

```typescript
// ❌ LIGNE 125-132 - SANS aria-label
<Button
  variant="ghost"
  size="icon"
  onClick={() => onNavigate('/search')}
  className="hidden md:flex"
>
  <Search className="h-5 w-5" />
</Button>

// ✅ CORRECTION
<Button
  variant="ghost"
  size="icon"
  onClick={() => onNavigate('/search')}
  className="hidden md:flex"
  aria-label="Rechercher des cours"
>
  <Search className="h-5 w-5" />
</Button>

// ❌ LIGNE 134-145 - SANS aria-label
<Button
  variant="ghost"
  size="icon"
  onClick={toggleTheme}
>
  {theme === 'dark' ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  )}
</Button>

// ✅ CORRECTION
<Button
  variant="ghost"
  size="icon"
  onClick={toggleTheme}
  aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
>
  {theme === 'dark' ? (
    <Sun className="h-5 w-5" />
  ) : (
    <Moon className="h-5 w-5" />
  )}
</Button>

// ❌ LIGNE 148-155 - SANS aria-label
<Button
  variant="ghost"
  size="icon"
  onClick={toggleLanguage}
  title={`Switch to ${preferences.language === 'fr' ? 'English' : 'Français'}`}
>
  <Globe className="h-5 w-5" />
</Button>

// ✅ CORRECTION (title est bon mais aria-label est mieux)
<Button
  variant="ghost"
  size="icon"
  onClick={toggleLanguage}
  aria-label={`Changer la langue vers ${preferences.language === 'fr' ? 'English' : 'Français'}`}
>
  <Globe className="h-5 w-5" />
</Button>

// ❌ LIGNE 159-174 - SANS aria-label
<Button
  variant="ghost"
  size="icon"
  onClick={() => onNavigate('/notifications')}
  className="relative"
>
  <Bell className="h-5 w-5" />
  {unreadNotifications > 0 && (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
    >
      {unreadNotifications > 9 ? '9+' : unreadNotifications}
    </Badge>
  )}
</Button>

// ✅ CORRECTION
<Button
  variant="ghost"
  size="icon"
  onClick={() => onNavigate('/notifications')}
  className="relative"
  aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} non lues)` : ''}`}
>
  <Bell className="h-5 w-5" />
  {unreadNotifications > 0 && (
    <Badge 
      variant="destructive" 
      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
      aria-hidden="true"
    >
      {unreadNotifications > 9 ? '9+' : unreadNotifications}
    </Badge>
  )}
</Button>

// ❌ LIGNE 89-96 - Menu mobile
<Button
  variant="ghost"
  size="icon"
  onClick={handleSidebarToggle}
  className="md:hidden"
>
  <Menu className="h-5 w-5" />
</Button>

// ✅ CORRECTION
<Button
  variant="ghost"
  size="icon"
  onClick={handleSidebarToggle}
  className="md:hidden"
  aria-label="Ouvrir le menu de navigation"
>
  <Menu className="h-5 w-5" />
</Button>

// ❌ LIGNE 261-272 - Menu mobile toggle
<Button
  variant="ghost"
  size="icon"
  className="md:hidden"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
>
  {isMobileMenuOpen ? (
    <X className="h-5 w-5" />
  ) : (
    <Menu className="h-5 w-5" />
  )}
</Button>

// ✅ CORRECTION
<Button
  variant="ghost"
  size="icon"
  className="md:hidden"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
  aria-expanded={isMobileMenuOpen}
>
  {isMobileMenuOpen ? (
    <X className="h-5 w-5" />
  ) : (
    <Menu className="h-5 w-5" />
  )}
</Button>
```

---

### 🔴 CORRECTION #4: Internationalisation des textes HeaderRedux

**Fichier:** `/components/layout/HeaderRedux.tsx`

**Textes à internationaliser:**

```typescript
// ❌ LIGNE 104
<span className="text-xl font-bold">Stream Éducatif</span>

// ✅ CORRECTION
<span className="text-xl font-bold">{t('app.name')}</span>

// ❌ LIGNE 71
{ path: '/live-sessions', label: 'Sessions Live' },

// ✅ CORRECTION
{ path: '/live-sessions', label: t('nav.liveSessions') },

// ❌ LIGNE 76
{ path: '/teacher/dashboard', label: 'Dashboard Enseignant' },

// ✅ CORRECTION
{ path: '/teacher/dashboard', label: t('nav.teacherDashboard') },

// ❌ LIGNE 77
{ path: '/teacher/live-sessions', label: 'Mes Sessions' },

// ✅ CORRECTION
{ path: '/teacher/live-sessions', label: t('nav.mySessions') },

// ❌ LIGNE 80
{ path: '/admin', label: 'Administration' },

// ✅ CORRECTION
{ path: '/admin', label: t('nav.admin') },

// ❌ LIGNE 202-203
{user.role === 'teacher' ? 'Enseignant' : 
 user.role === 'admin' ? 'Administrateur' : 'Étudiant'}

// ✅ CORRECTION
{user.role === 'teacher' ? t('roles.teacher') : 
 user.role === 'admin' ? t('roles.admin') : t('roles.student')}

// ❌ LIGNE 220
<span>Tableau de bord</span>

// ✅ CORRECTION
<span>{t('nav.dashboard')}</span>

// ❌ LIGNE 225
<span>Mon Profil</span>

// ✅ CORRECTION
<span>{t('nav.profile')}</span>

// ❌ LIGNE 230
<span>Paramètres</span>

// ✅ CORRECTION
<span>{t('nav.settings')}</span>

// ❌ LIGNE 240
<span>Se déconnecter</span>

// ✅ CORRECTION
<span>{t('auth.signout')}</span>

// ❌ LIGNE 303
Rechercher

// ✅ CORRECTION
{t('nav.search')}
```

**Fichier de traduction à créer/compléter:** `/lib/i18n.ts`

Ajouter ces clés de traduction:
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
    app: {
      name: 'Stream Educative',
    },
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      liveSessions: 'Live Sessions',
      teacherDashboard: 'Teacher Dashboard',
      mySessions: 'My Sessions',
      admin: 'Administration',
      dashboard: 'Dashboard',
      profile: 'My Profile',
      settings: 'Settings',
      search: 'Search',
    },
    roles: {
      student: 'Student',
      teacher: 'Teacher',
      admin: 'Administrator',
    },
    auth: {
      signin: 'Sign In',
      signup: 'Sign Up',
      signout: 'Sign Out',
    },
  },
};
```

---

### 🔴 CORRECTION #5: Fallback CSS pour color-mix

**Fichier:** `/styles/globals.css`

```css
/* ❌ LIGNE 208-216 - SANS FALLBACK */
.loading-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklch, var(--color-muted) 50%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* ✅ CORRECTION */
.loading-shimmer {
  /* Fallback pour navigateurs sans support color-mix */
  background: linear-gradient(
    90deg,
    transparent,
    rgba(241, 245, 249, 0.5),
    transparent
  );
  /* Version moderne avec color-mix */
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklch, var(--color-muted) 50%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Fallback pour dark mode */
.dark .loading-shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(38, 38, 38, 0.5),
    transparent
  );
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in oklch, var(--color-muted) 50%, transparent),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Même chose pour:**

```css
/* LIGNE 363-365 */
.bg-status-success {
  /* Ajouter fallback */
  background-color: rgba(16, 185, 129, 0.1);
  background-color: color-mix(in oklch, var(--color-success) 10%, transparent);
  color: var(--color-success);
}

/* LIGNE 367-370 */
.bg-status-warning {
  background-color: rgba(245, 158, 11, 0.1);
  background-color: color-mix(in oklch, var(--color-warning) 10%, transparent);
  color: var(--color-warning);
}

/* LIGNE 372-375 */
.bg-status-error {
  background-color: rgba(239, 68, 68, 0.1);
  background-color: color-mix(in oklch, var(--color-error) 10%, transparent);
  color: var(--color-error);
}

/* LIGNE 377-380 */
.bg-status-info {
  background-color: rgba(59, 130, 246, 0.1);
  background-color: color-mix(in oklch, var(--color-info) 10%, transparent);
  color: var(--color-info);
}
```

---

### 🔴 CORRECTION #6: Remplacer setTimeout dans App.tsx

**Fichier:** `/App.tsx`

```typescript
// ❌ LIGNE 158-164 - PROBLÉMATIQUE
if (config.requireAuth && !isAuthenticated) {
  if (!currentPath.startsWith('/auth') && !hasRedirected.current) {
    hasRedirected.current = true;
    configUtils.warn('Access denied: Authentication required', { path: currentPath });
    setTimeout(() => {
      navigate(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
    }, 0);
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// ✅ CORRECTION (supprimer le setTimeout)
if (config.requireAuth && !isAuthenticated) {
  if (!currentPath.startsWith('/auth') && !hasRedirected.current) {
    hasRedirected.current = true;
    configUtils.warn('Access denied: Authentication required', { path: currentPath });
    // Navigation immédiate sans setTimeout
    navigate(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
  }
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// ❌ LIGNE 182-195 - MÊME PROBLÈME
if (!hasRedirected.current) {
  hasRedirected.current = true;
  configUtils.warn('Access denied: Insufficient permissions', { 
    path: currentPath, 
    userRole: user?.role,
    requiredRoles: config.allowedRoles 
  });
  
  setTimeout(() => {
    if (isAuthenticated && user?.role) {
      const dashboardPaths: Record<string, string> = {
        admin: '/admin',
        teacher: '/teacher/dashboard',
        student: '/dashboard',
      };
      const redirectPath = dashboardPaths[user.role] || '/';
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    } else if (!currentPath.startsWith('/auth')) {
      navigate('/auth/signin');
    }
  }, 0);
}

// ✅ CORRECTION
if (!hasRedirected.current) {
  hasRedirected.current = true;
  configUtils.warn('Access denied: Insufficient permissions', { 
    path: currentPath, 
    userRole: user?.role,
    requiredRoles: config.allowedRoles 
  });
  
  // Navigation immédiate sans setTimeout
  if (isAuthenticated && user?.role) {
    const dashboardPaths: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher/dashboard',
      student: '/dashboard',
    };
    const redirectPath = dashboardPaths[user.role] || '/';
    if (currentPath !== redirectPath) {
      navigate(redirectPath);
    }
  } else if (!currentPath.startsWith('/auth')) {
    navigate('/auth/signin');
  }
}
```

---

### 🔴 CORRECTION #7: Utiliser authStorage dans authApi

**Fichier:** `/store/api/authApi.ts`

```typescript
// ❌ LIGNE 227-245 - Accès direct à localStorage
getCurrentUser: builder.query<User, void>({
  queryFn: async (_, api, extraOptions, baseQuery) => {
    console.log('Get current user');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Import authStorage dynamically to avoid circular dependencies
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        error: {
          status: 401,
          data: { message: 'No token provided' }
        }
      };
    }
    
    // Get user from localStorage with correct key
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return { data: user };
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    
    return {
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        avatar: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  },
  
  providesTags: ['User'],
}),

// ✅ CORRECTION
getCurrentUser: builder.query<User, void>({
  queryFn: async (_, api, extraOptions, baseQuery) => {
    console.log('Get current user');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Utiliser authStorage au lieu de localStorage direct
    const authData = authStorage.loadAuthData();
    if (!authData || !authData.token) {
      return {
        error: {
          status: 401,
          data: { message: 'No token provided' }
        }
      };
    }
    
    if (authData.user) {
      return { data: authData.user };
    }
    
    // Fallback user si pas dans authStorage
    return {
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        avatar: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    };
  },
  
  providesTags: ['User'],
}),
```

**Ajouter l'import en haut du fichier:**
```typescript
import { authStorage } from '../../lib/localStorage';
```

---

### 🔴 CORRECTION #8: Supprimer les console.log

**Fichier:** `/lib/router.tsx`

```typescript
// ❌ SUPPRIMER toutes les lignes console.log
console.log('Initial path:', window.location.pathname); // Ligne 15
console.log('Setting initial path:', initialPath); // Ligne 25
console.log('Pop state event, new path:', window.location.pathname); // Ligne 29
console.log('Navigating from', currentPath, 'to', path); // Ligne 38
console.log('Setting path to:', path); // Ligne 52

// ✅ REMPLACER par configUtils si nécessaire
import { configUtils } from './config';

configUtils.debug('Initial path:', window.location.pathname);
configUtils.debug('Setting initial path:', initialPath);
configUtils.debug('Pop state event, new path:', window.location.pathname);
configUtils.debug('Navigating from', currentPath, 'to', path);
configUtils.debug('Setting path to:', path);
```

**Fichier:** `/components/pages/StudentDashboard.tsx`

```typescript
// ❌ LIGNE 51
console.log('Current user in StudentDashboard:', currentUser);

// ✅ REMPLACER
configUtils.debug('Current user in StudentDashboard:', currentUser);

// ❌ LIGNE 200
console.log('No user found after loading, redirecting to signin');

// ✅ REMPLACER
configUtils.warn('No user found after loading, redirecting to signin');
```

**Fichier:** `/store/api/authApi.ts`

Remplacer tous les `console.log` par `configUtils.debug`:
```typescript
// ❌ Lignes 25, 77, 116, 132, 144, 164, 179, 202, 222
console.log('Login attempt:', credentials.email);
console.log('Register attempt:', userData.email);
// etc.

// ✅ CORRECTION
import { configUtils } from '../../lib/config';
configUtils.debug('Login attempt:', credentials.email);
configUtils.debug('Register attempt:', userData.email);
```

---

## ✅ CHECKLIST D'EXÉCUTION

### Phase 1 - Imports (1-2 heures)
- [ ] Corriger StudentDashboard.tsx
- [ ] Corriger HomePage.tsx
- [ ] Corriger CourseDetail.tsx
- [ ] Corriger CourseCatalog.tsx
- [ ] Corriger ProfilePage.tsx
- [ ] Corriger AuthPage.tsx
- [ ] Corriger ProgrammingCoursesPage.tsx
- [ ] Corriger DesignCoursesPage.tsx
- [ ] Corriger MarketingCoursesPage.tsx
- [ ] Corriger Header.tsx
- [ ] Vérifier que mockCourses est exporté de mockData.ts

### Phase 2 - Accessibilité (1 heure)
- [ ] Ajouter aria-label au bouton Search
- [ ] Ajouter aria-label au bouton Theme
- [ ] Ajouter aria-label au bouton Language
- [ ] Ajouter aria-label au bouton Notifications
- [ ] Ajouter aria-label aux boutons Menu mobile
- [ ] Ajouter aria-expanded au menu mobile

### Phase 3 - Internationalisation (2 heures)
- [ ] Créer/compléter les clés de traduction dans i18n.ts
- [ ] Remplacer tous les textes en dur dans HeaderRedux.tsx
- [ ] Tester en FR et EN

### Phase 4 - CSS et Styles (30 minutes)
- [ ] Ajouter fallbacks pour loading-shimmer
- [ ] Ajouter fallbacks pour bg-status-*
- [ ] Tester sur Safari < 16.2 si possible

### Phase 5 - Code Quality (1 heure)
- [ ] Supprimer setTimeout dans App.tsx (2 endroits)
- [ ] Utiliser authStorage dans authApi.ts
- [ ] Remplacer console.log par configUtils
- [ ] Vérifier qu'il n'y a pas de régression

### Phase 6 - Tests (1 heure)
- [ ] Tester login/logout
- [ ] Tester navigation entre les pages
- [ ] Tester changement de langue
- [ ] Tester changement de thème
- [ ] Tester redirections basées sur les rôles
- [ ] Tester accessibilité clavier
- [ ] Tester sur mobile

---

## 🎯 TEMPS ESTIMÉ TOTAL: 6-8 heures

Après ces corrections, l'application sera beaucoup plus robuste et maintenable.

---

*Document généré le 2 novembre 2025*
