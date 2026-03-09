# 🌍 Système d'Internationalisation (i18n) - Stream Éducatif

## ✨ Vue d'ensemble

Stream Éducatif dispose maintenant d'un **système d'internationalisation complet et professionnel** basé sur **react-i18next**, offrant une expérience bilingue (Français/Anglais) avec :

- ✅ **Support ICU MessageFormat** - Pluralisation et interpolation avancées
- ✅ **Gestion des fuseaux horaires** - Dates/heures localisées automatiquement
- ✅ **Formatage intelligent** - Nombres, devises, pourcentages selon la locale
- ✅ **Temps relatif** - "il y a 2 heures", "dans 3 jours"
- ✅ **Détection automatique** - Langue du navigateur, localStorage
- ✅ **Changement en temps réel** - Sans rechargement de page
- ✅ **Performance optimisée** - Lazy loading des traductions
- ✅ **Accessibilité WCAG AA** - Support complet aria-labels

## 🚀 Quick Start

### Utilisation basique

```tsx
import { useI18n } from '../../hooks/useI18n';

function MyComponent() {
  const { t, currentLanguage, changeLanguage } = useI18n();
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <button onClick={() => changeLanguage('fr')}>
        Français
      </button>
    </div>
  );
}
```

### Ajouter le sélecteur de langue

```tsx
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

<LanguageSwitcher variant="ghost" size="icon" />
```

## 📁 Structure des fichiers

```
📦 Stream Éducatif
├── 📂 locales/               # Fichiers de traduction
│   ├── 📂 en/                # Anglais
│   │   ├── common.json       # Traductions communes
│   │   ├── auth.json         # Authentification
│   │   ├── course.json       # Cours
│   │   ├── navigation.json   # Navigation
│   │   ├── home.json         # Page d'accueil
│   │   ├── video.json        # Lecteur vidéo
│   │   ├── dashboard.json    # Tableaux de bord
│   │   └── chat.json         # Chat/Messagerie
│   └── 📂 fr/                # Français (même structure)
│
├── 📂 config/
│   └── i18n.ts               # Configuration react-i18next
│
├── 📂 hooks/
│   └── useI18n.ts            # Hook personnalisé avec utilitaires
│
├── 📂 components/
│   ├── 📂 i18n/
│   │   └── LanguageSwitcher.tsx  # Composant sélecteur
│   └── 📂 providers/
│       └── I18nProvider.tsx      # Provider React
│
└── 📄 Documentation
    ├── I18N_GUIDE.md         # Guide complet d'utilisation
    ├── I18N_MIGRATION.md     # Guide de migration
    └── I18N_README.md        # Ce fichier
```

## 🎯 Fonctionnalités principales

### 1. Traduction de texte

```tsx
const { t } = useI18n();

// Basique
t('common:loading')                    // "Chargement..." / "Loading..."

// Avec interpolation
t('welcome', { name: 'Alice' })        // "Bienvenue, Alice !" / "Welcome, Alice!"

// Avec pluralisation
t('course:studentsCount', { count: 5 }) // "5 étudiants" / "5 students"
```

### 2. Formatage de dates

```tsx
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useI18n();

formatDate(new Date())                  // "2 janv. 2026" / "Jan 2, 2026"
formatTime(new Date())                  // "14:30" / "2:30 PM"
formatDateTime(new Date())              // "2 janv. 2026, 14:30"
formatRelativeTime(yesterday)           // "il y a 1 jour" / "1 day ago"
```

### 3. Formatage de nombres

```tsx
const { formatNumber, formatCurrency, formatPercent } = useI18n();

formatNumber(1234.56)                   // "1 234,56" / "1,234.56"
formatCurrency(99.99, 'EUR')            // "99,99 €" / "€99.99"
formatPercent(75)                       // "75 %" / "75%"
```

### 4. Changement de langue

```tsx
const { changeLanguage, currentLanguage } = useI18n();

// Changer la langue
changeLanguage('fr');  // ou 'en'

// Langue actuelle
console.log(currentLanguage);  // 'fr' ou 'en'
```

## 🎨 Composants disponibles

### LanguageSwitcher (Dropdown complet)

```tsx
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

<LanguageSwitcher 
  variant="ghost"      // ou "default", "outline"
  size="sm"            // ou "default", "lg", "icon"
  showLabel={false}    // Afficher le nom de la langue
  align="end"          // ou "start", "center"
/>
```

### CompactLanguageSwitcher (Toggle simple)

```tsx
import { CompactLanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

<CompactLanguageSwitcher />  // Bascule entre FR/EN
```

### FlagLanguageSwitcher (Avec drapeaux)

```tsx
import { FlagLanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

<FlagLanguageSwitcher />  // Affiche 🇫🇷 / 🇬🇧
```

## 📚 Namespaces disponibles

| Namespace | Description | Exemples de clés |
|-----------|-------------|------------------|
| `common` | Textes communs | `loading`, `save`, `cancel`, `error` |
| `auth` | Authentification | `signin`, `signup`, `password`, `email` |
| `course` | Cours | `title`, `enroll`, `instructor`, `students` |
| `navigation` | Navigation | `home`, `catalog`, `search`, `profile` |
| `home` | Page d'accueil | `hero.title`, `features.title`, `cta` |
| `video` | Lecteur vidéo | `play`, `pause`, `fullscreen`, `quality` |
| `dashboard` | Tableaux de bord | `welcome`, `statistics`, `recentActivity` |
| `chat` | Chat/Messagerie | `sendMessage`, `typing`, `chatbot.title` |

## 💡 Exemples d'utilisation

### Exemple 1 : Card de cours

```tsx
function CourseCard({ course }) {
  const { t, formatCurrency, formatRelativeTime } = useI18n();
  
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{t('course:studentsCount', { count: course.students })}</p>
      <span className="price">
        {course.price === 0 
          ? t('course:free') 
          : formatCurrency(course.price)
        }
      </span>
      <small>
        {t('course:lastUpdated')}: {formatRelativeTime(course.updatedAt)}
      </small>
      <button>{t('course:enroll')}</button>
    </div>
  );
}
```

### Exemple 2 : Session live

```tsx
function LiveSession({ session }) {
  const { t, formatDateTime, userTimezone } = useI18n();
  
  return (
    <div>
      <h2>{session.title}</h2>
      <p>
        {t('course:sessionStartsIn', { 
          time: formatDateTime(session.startTime, { timeZone: userTimezone })
        })}
      </p>
      <button>{t('course:joinLive')}</button>
    </div>
  );
}
```

### Exemple 3 : Dashboard statistiques

```tsx
function DashboardStats({ stats }) {
  const { t, formatNumber, formatPercent } = useI18n();
  
  return (
    <div className="stats-grid">
      <div className="stat">
        <h4>{t('dashboard:student.totalCourses')}</h4>
        <p>{formatNumber(stats.totalCourses)}</p>
      </div>
      <div className="stat">
        <h4>{t('dashboard:student.progress')}</h4>
        <p>{formatPercent(stats.completionRate)}</p>
      </div>
    </div>
  );
}
```

## 🔧 Configuration

La configuration se trouve dans `/config/i18n.ts` :

```ts
i18n
  .use(LanguageDetector)      // Détection automatique
  .use(initReactI18next)      // Integration React
  .init({
    fallbackLng: 'en',        // Langue par défaut
    defaultNS: 'common',      // Namespace par défaut
    debug: false,             // Logs de debug
    interpolation: {
      escapeValue: false,     // React échappe déjà
    },
  });
```

## 🌐 Détection de langue

Le système détecte automatiquement la langue dans cet ordre :

1. **localStorage** (`i18nextLng`) - Préférence sauvegardée
2. **Navigator** (`navigator.language`) - Langue du navigateur
3. **HTML tag** (`<html lang="...">`) - Attribut HTML
4. **Fallback** - Anglais par défaut

## ✅ Avantages du système

| Fonctionnalité | Description |
|----------------|-------------|
| 🚀 **Performance** | Lazy loading, cache, optimisations |
| 🎯 **Type-safe** | Support TypeScript complet |
| 🔄 **Hot reload** | Changement sans rechargement |
| 📱 **Responsive** | Adapté mobile/tablet/desktop |
| ♿ **Accessible** | WCAG AA compliant |
| 🧪 **Testable** | Tests unitaires faciles |
| 📦 **Extensible** | Ajout de langues simple |
| 🔍 **Debug** | Logs détaillés en dev |

## 📖 Documentation complète

- **[I18N_GUIDE.md](./I18N_GUIDE.md)** - Guide complet d'utilisation
- **[I18N_MIGRATION.md](./I18N_MIGRATION.md)** - Guide de migration de l'ancien système
- **[react-i18next docs](https://react.i18next.com/)** - Documentation officielle

## 🐛 Problèmes courants

### Clé non traduite

```
Symptôme : Affiche "navigation:home" au lieu de "Accueil"
Solution : Vérifier que la clé existe dans /locales/fr/navigation.json
```

### Changement de langue ne fonctionne pas

```
Symptôme : Les textes ne changent pas
Solution : Vérifier que le composant utilise useI18n() et pas useTranslation()
```

### Format de date incorrect

```
Symptôme : Date en anglais malgré locale FR
Solution : Utiliser formatDate() au lieu de toLocaleDateString()
```

## 🎓 Formation

### Pour les développeurs

1. Lire [I18N_GUIDE.md](./I18N_GUIDE.md)
2. Voir les exemples dans `/components/layout/HeaderRedux.tsx`
3. Tester avec les deux langues
4. Utiliser les utilitaires de formatage

### Pour les traducteurs

1. Éditer les fichiers dans `/locales/fr/` et `/locales/en/`
2. Respecter la structure JSON
3. Tester les interpolations `{{variable}}`
4. Vérifier les pluralisations `_plural`

## 📞 Support

Pour toute question sur le système i18n :

1. Consulter la documentation
2. Vérifier les exemples dans le code
3. Tester avec les outils de debug
4. Contacter l'équipe technique

---

**Version** : 1.0.0  
**Date** : 2 janvier 2026  
**Auteur** : Stream Éducatif Team  
**Technologies** : react-i18next, TypeScript, React 18

🌟 **Le système i18n est maintenant prêt à l'emploi !** 🌟
