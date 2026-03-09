# Guide d'Internationalisation (i18n) - Stream Éducatif

## 📚 Vue d'ensemble

Stream Éducatif utilise **react-i18next** pour l'internationalisation complète de la plateforme, offrant une expérience bilingue (FR/EN) professionnelle avec support ICU MessageFormat et gestion des fuseaux horaires.

## 🏗️ Architecture

### Structure des fichiers

```
/locales
├── en/
│   ├── common.json          # Traductions communes
│   ├── auth.json            # Authentification
│   ├── course.json          # Cours
│   ├── navigation.json      # Navigation
│   ├── home.json            # Page d'accueil
│   ├── video.json           # Lecteur vidéo
│   ├── dashboard.json       # Tableaux de bord
│   └── chat.json            # Chat et messagerie
└── fr/
    └── (même structure)

/config
└── i18n.ts                  # Configuration i18next

/hooks
└── useI18n.ts               # Hook personnalisé avec utilitaires

/components/i18n
├── LanguageSwitcher.tsx     # Composant sélecteur de langue
└── ...

/components/providers
└── I18nProvider.tsx         # Provider React
```

## 🚀 Utilisation de base

### 1. Dans un composant React

```tsx
import { useI18n } from '../../hooks/useI18n';

function MyComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('auth:signin')}</p>
    </div>
  );
}
```

### 2. Interpolation de variables

```tsx
// Dans le JSON
{
  "welcome": "Bienvenue, {{name}} !",
  "courseCount": "Vous avez {{count}} cours"
}

// Dans le code
<h1>{t('common:welcome', { name: user.firstName })}</h1>
<p>{t('course:courseCount', { count: 5 })}</p>
```

### 3. Pluralisation (ICU compatible)

```tsx
// Dans le JSON
{
  "studentsCount": "{{count}} étudiant",
  "studentsCount_plural": "{{count}} étudiants"
}

// Dans le code
<p>{t('course:studentsCount', { count: 1 })}</p>  // "1 étudiant"
<p>{t('course:studentsCount', { count: 5 })}</p>  // "5 étudiants"
```

### 4. Utilisation avec namespaces

```tsx
// Spécifier le namespace avec ':'
t('common:loading')        // Namespace 'common'
t('auth:signin')           // Namespace 'auth'
t('course:title')          // Namespace 'course'
t('navigation:home')       // Namespace 'navigation'
```

## 🛠️ Fonctionnalités avancées

### Formatage des dates

```tsx
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useI18n();

// Format de date
formatDate(new Date())                           // "2 janv. 2026" (FR) / "Jan 2, 2026" (EN)
formatDate(new Date(), { dateStyle: 'full' })   // "vendredi 2 janvier 2026"

// Format de l'heure
formatTime(new Date())                          // "14:30" (FR) / "2:30 PM" (EN)
formatTime(new Date(), { hour12: true })        // "2:30 PM"

// Date et heure combinées
formatDateTime(new Date())                      // "2 janv. 2026, 14:30"

// Temps relatif
formatRelativeTime(yesterday)                   // "il y a 1 jour" / "1 day ago"
formatRelativeTime(tomorrow)                    // "dans 1 jour" / "in 1 day"
```

### Formatage des nombres

```tsx
const { formatNumber, formatCurrency, formatPercent } = useI18n();

// Nombres
formatNumber(1234.56)                           // "1 234,56" (FR) / "1,234.56" (EN)

// Devises
formatCurrency(99.99, 'EUR')                    // "99,99 €" (FR) / "€99.99" (EN)
formatCurrency(49.99, 'USD')                    // "49,99 $US"

// Pourcentages
formatPercent(75)                               // "75 %" (FR) / "75%" (EN)
formatPercent(85.5, 1)                          // "85,5 %"
```

### Formatage de durée

```tsx
const { formatDuration } = useI18n();

formatDuration(45)      // "45m"
formatDuration(90)      // "1h 30m"
formatDuration(120)     // "2h"
```

### Changer de langue

```tsx
const { changeLanguage, currentLanguage } = useI18n();

// Changer la langue
changeLanguage('fr');   // Français
changeLanguage('en');   // Anglais

// Obtenir la langue actuelle
console.log(currentLanguage);  // 'fr' ou 'en'
```

## 🎨 Composants UI

### LanguageSwitcher

```tsx
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

// Version dropdown complète
<LanguageSwitcher variant="ghost" size="sm" showLabel />

// Version icône uniquement
<LanguageSwitcher variant="ghost" size="icon" />
```

### CompactLanguageSwitcher

```tsx
import { CompactLanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

// Bascule simple entre langues
<CompactLanguageSwitcher />
```

### FlagLanguageSwitcher

```tsx
import { FlagLanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

// Avec drapeaux emoji
<FlagLanguageSwitcher />
```

## 📝 Bonnes pratiques

### 1. Organisation des clés

```json
// ✅ BIEN - Hiérarchique et clair
{
  "auth": {
    "signin": "Se connecter",
    "signup": "S'inscrire",
    "errors": {
      "invalidCredentials": "Email ou mot de passe invalide"
    }
  }
}

// ❌ MAL - Plat et peu organisé
{
  "authSignin": "Se connecter",
  "authSignup": "S'inscrire"
}
```

### 2. Valeurs par défaut

```tsx
// Toujours fournir une valeur par défaut pour les clés optionnelles
t('common:newFeature', { defaultValue: 'New Feature' })
```

### 3. Accessibilité

```tsx
// Toujours traduire les aria-label
<Button aria-label={t('common:close')}>
  <X />
</Button>
```

### 4. Gestion des fuseaux horaires

```tsx
const { formatDateTime, userTimezone } = useI18n();

// Afficher avec le fuseau horaire de l'utilisateur
formatDateTime(sessionDate, { timeZone: userTimezone })

// Fuseau horaire spécifique
formatDateTime(sessionDate, { timeZone: 'America/New_York' })
```

## 🌍 Langues supportées

| Code | Langue    | Nom natif |
|------|-----------|-----------|
| `en` | English   | English   |
| `fr` | French    | Français  |

## 🔄 Détection automatique

Le système détecte automatiquement la langue de l'utilisateur dans cet ordre :
1. Préférence sauvegardée dans `localStorage` (`i18nextLng`)
2. Langue du navigateur (`navigator.language`)
3. Attribut HTML `lang` du document
4. Langue par défaut : `en`

## 🆕 Ajouter une nouvelle langue

1. **Créer les fichiers de traduction**
   ```
   /locales/es/
   ├── common.json
   ├── auth.json
   └── ...
   ```

2. **Mettre à jour la configuration**
   ```ts
   // /config/i18n.ts
   export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es'] as const;
   
   export const LANGUAGE_NAMES = {
     en: { native: 'English', english: 'English' },
     fr: { native: 'Français', english: 'French' },
     es: { native: 'Español', english: 'Spanish' },
   };
   ```

3. **Importer les traductions**
   ```ts
   import commonES from '../locales/es/common.json';
   
   i18n.init({
     resources: {
       // ...
       es: {
         common: commonES,
         // ...
       }
     }
   });
   ```

## 📊 Exemple complet

```tsx
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

function CourseCard({ course }) {
  const { 
    t, 
    formatDate, 
    formatCurrency, 
    formatRelativeTime,
    currentLanguage 
  } = useI18n();

  return (
    <div className="course-card">
      {/* Titre traduit */}
      <h2>{course.title[currentLanguage]}</h2>
      
      {/* Texte avec interpolation */}
      <p>{t('course:studentsCount', { count: course.enrolledStudents })}</p>
      
      {/* Prix formaté selon la locale */}
      <span className="price">
        {course.price === 0 
          ? t('course:free') 
          : formatCurrency(course.price)
        }
      </span>
      
      {/* Date formatée */}
      <div className="date">
        {t('course:publishedDate')}: {formatDate(course.publishedAt)}
      </div>
      
      {/* Temps relatif */}
      <div className="updated">
        {t('course:lastUpdated')}: {formatRelativeTime(course.updatedAt)}
      </div>
      
      {/* Bouton avec traduction */}
      <button>
        {course.isLive ? t('course:joinLive') : t('course:enroll')}
      </button>
    </div>
  );
}
```

## 🐛 Débogage

En mode développement, i18next affiche des logs dans la console :
```
i18next::translator: missingKey en translation common.unknownKey unknownKey
```

Pour activer/désactiver le mode debug :
```ts
// /config/i18n.ts
i18n.init({
  debug: true,  // ou false
  // ...
});
```

## 📚 Ressources

- [Documentation react-i18next](https://react.i18next.com/)
- [Documentation i18next](https://www.i18next.com/)
- [ICU MessageFormat](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Intl API MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

## ✅ Checklist de migration

- [ ] Remplacer tous les appels à l'ancien `useTranslation` par `useI18n`
- [ ] Mettre à jour les namespaces (common, auth, course, etc.)
- [ ] Utiliser `formatDate` au lieu de formatage manuel
- [ ] Utiliser `formatCurrency` pour les prix
- [ ] Ajouter `LanguageSwitcher` dans le header
- [ ] Traduire tous les `aria-label`
- [ ] Tester avec les deux langues (FR/EN)
- [ ] Vérifier les pluralisations
- [ ] Vérifier les interpolations
- [ ] Tester le changement de langue en temps réel

---

**Dernière mise à jour** : 2 janvier 2026  
**Version** : 1.0.0
