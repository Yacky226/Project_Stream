# Guide de Migration i18n - Stream Éducatif

## 🎯 Objectif

Ce guide explique comment migrer de l'ancien système i18n personnalisé vers le nouveau système basé sur **react-i18next**.

## 📋 Changements principaux

### Avant (ancien système)
```tsx
import { useTranslation } from '../../lib/i18n';

const { t, getCurrentLanguage, setLanguage } = useTranslation();
const text = t('common.loading');
```

### Après (nouveau système)
```tsx
import { useI18n } from '../../hooks/useI18n';

const { t, currentLanguage, changeLanguage } = useI18n();
const text = t('common:loading');  // Note le ':' au lieu du '.'
```

## 🔄 Tableau de correspondance

| Ancien système | Nouveau système | Notes |
|----------------|-----------------|-------|
| `t('common.loading')` | `t('common:loading')` | Utiliser `:` pour les namespaces |
| `t('nav.home')` | `t('navigation:home')` | Namespace renommé |
| `t('home.hero.badge')` | `t('home:hero.badge')` | Namespace `home` |
| `t('footer.newsletter.title')` | `t('home:footer.newsletter.title')` | Dans namespace `home` |
| `t('video.play')` | `t('video:play')` | Nouveau namespace dédié |
| `getCurrentLanguage()` | `currentLanguage` | Propriété directe |
| `setLanguage('fr')` | `changeLanguage('fr')` | Fonction renommée |

## 📝 Étapes de migration par composant

### 1. Mettre à jour les imports

```diff
- import { useTranslation } from '../../lib/i18n';
+ import { useI18n } from '../../hooks/useI18n';
```

### 2. Mettre à jour les appels de hook

```diff
- const { t, getCurrentLanguage, setLanguage } = useTranslation();
+ const { t, currentLanguage, changeLanguage } = useI18n();
```

### 3. Mettre à jour les clés de traduction

```diff
- {t('common.loading')}
+ {t('common:loading')}

- {t('nav.catalog')}
+ {t('navigation:catalog')}

- {t('home.hero.title')}
+ {t('home:hero.title')}

- {t('auth.signin')}
+ {t('auth:signin')}

- {t('course.title')}
+ {t('course:title')}
```

### 4. Mettre à jour les changements de langue

```diff
- setLanguage('fr')
+ changeLanguage('fr')

- const lang = getCurrentLanguage()
+ const lang = currentLanguage
```

## 🔧 Nouvelles fonctionnalités disponibles

### Formatage de dates

```tsx
// AVANT - Manuel
const formatDate = (date: Date) => {
  return date.toLocaleDateString(currentLanguage);
};

// APRÈS - Automatique avec i18n
const { formatDate, formatTime, formatDateTime } = useI18n();
formatDate(new Date());                    // "2 janv. 2026"
formatTime(new Date());                    // "14:30"
formatDateTime(new Date());                // "2 janv. 2026, 14:30"
```

### Temps relatif

```tsx
const { formatRelativeTime } = useI18n();

formatRelativeTime(yesterday);  // "il y a 1 jour" / "1 day ago"
formatRelativeTime(tomorrow);   // "dans 1 jour" / "in 1 day"
```

### Formatage de nombres et devises

```tsx
const { formatNumber, formatCurrency, formatPercent } = useI18n();

formatNumber(1234.56);          // "1 234,56" (FR) / "1,234.56" (EN)
formatCurrency(99.99, 'EUR');   // "99,99 €"
formatPercent(75);              // "75 %"
```

### Composant Trans pour HTML complexe

```tsx
import { Trans } from 'react-i18next';

// Texte avec composants React imbriqués
<Trans i18nKey="course:enrollmentInfo">
  Rejoignez <strong>{{count}}</strong> étudiants qui suivent ce cours
</Trans>
```

## 🗂️ Migration des fichiers de traduction

### Ancienne structure (lib/i18n.ts)
```ts
export const translations = {
  en: {
    common: { loading: 'Loading...' },
    nav: { home: 'Home' }
  },
  fr: {
    common: { loading: 'Chargement...' },
    nav: { home: 'Accueil' }
  }
};
```

### Nouvelle structure (fichiers JSON séparés)
```
/locales/en/common.json
{ "loading": "Loading..." }

/locales/en/navigation.json
{ "home": "Home" }

/locales/fr/common.json
{ "loading": "Chargement..." }

/locales/fr/navigation.json
{ "home": "Accueil" }
```

## 📦 Namespaces disponibles

| Namespace | Contenu | Exemple |
|-----------|---------|---------|
| `common` | Textes communs | `t('common:loading')` |
| `auth` | Authentification | `t('auth:signin')` |
| `course` | Cours | `t('course:title')` |
| `navigation` | Navigation | `t('navigation:home')` |
| `home` | Page d'accueil | `t('home:hero.title')` |
| `video` | Lecteur vidéo | `t('video:play')` |
| `dashboard` | Tableaux de bord | `t('dashboard:welcome')` |
| `chat` | Chat/Messagerie | `t('chat:sendMessage')` |

## 🎨 Migration du HeaderRedux (Exemple complet)

### AVANT
```tsx
const { t, setLanguage } = useTranslation();
const { preferences } = useAppSelector(state => state.ui);

const toggleLanguage = () => {
  const newLang = preferences.language === 'fr' ? 'en' : 'fr';
  dispatch(setLanguage(newLang));
};

// Render
<Button onClick={toggleLanguage}>
  <Globe />
</Button>
{t('nav.home')}
```

### APRÈS
```tsx
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

const { t } = useI18n();

// Render
<LanguageSwitcher variant="ghost" size="icon" />
{t('navigation:home')}
```

## 🚀 Composants prêts à l'emploi

### LanguageSwitcher

```tsx
import { LanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

// Dans le header
<LanguageSwitcher variant="ghost" size="icon" />

// Avec label
<LanguageSwitcher variant="ghost" showLabel />
```

### Version compacte

```tsx
import { CompactLanguageSwitcher } from '../../components/i18n/LanguageSwitcher';

<CompactLanguageSwitcher />
```

## ⚠️ Points d'attention

### 1. Clés imbriquées

```diff
- t('home.hero.title')        // Ancien: point pour tout
+ t('home:hero.title')         // Nouveau: ':' pour namespace, '.' pour imbrication
```

### 2. Interpolation

L'interpolation fonctionne de la même manière :
```tsx
// Fonctionne dans les deux systèmes
t('welcome', { name: 'Alice' })
```

### 3. Pluralisation

```tsx
// Ancien système (manuel)
const text = count === 1 ? t('student') : t('students');

// Nouveau système (automatique)
t('course:studentsCount', { count })  // Gère automatiquement singulier/pluriel
```

### 4. Valeurs par défaut

```tsx
// Toujours fournir un fallback pour les nouvelles clés
t('newFeature:title', { defaultValue: 'New Feature' })
```

## 🧪 Tests de migration

### Checklist par composant

```markdown
- [ ] Import mis à jour (useI18n au lieu de useTranslation)
- [ ] Toutes les clés utilisent ':' pour les namespaces
- [ ] Les références à getCurrentLanguage() sont remplacées par currentLanguage
- [ ] Les appels setLanguage() sont remplacés par changeLanguage()
- [ ] Les dates utilisent formatDate/formatTime
- [ ] Les devises utilisent formatCurrency
- [ ] Testé en FR et EN
- [ ] Pas d'erreurs dans la console
- [ ] Les traductions s'affichent correctement
```

## 📋 Ordre de migration recommandé

1. **Provider et configuration** ✅ (Déjà fait)
   - `/config/i18n.ts`
   - `/components/providers/I18nProvider.tsx`
   - `/App.tsx`

2. **Layout components**
   - `/components/layout/HeaderRedux.tsx` ✅ (Déjà fait)
   - `/components/layout/Footer.tsx`
   - `/components/layout/PageHeader.tsx`

3. **Pages principales**
   - `/components/pages/HomePage.tsx`
   - `/components/pages/CourseCatalog.tsx`
   - `/components/pages/AuthPageRedux.tsx`

4. **Dashboards**
   - `/components/pages/StudentDashboard.tsx`
   - `/components/pages/TeacherDashboard.tsx`
   - `/components/pages/AdminDashboard.tsx`

5. **Composants spécialisés**
   - `/components/video/VideoPlayer.tsx`
   - `/components/live/` (tous les composants)
   - `/components/chatbot/` (tous les composants)

## 🔍 Trouver les occurrences à migrer

Utilisez la recherche dans le projet :

```bash
# Trouver tous les imports de l'ancien système
grep -r "from '.*lib/i18n'" src/

# Trouver les utilisations de useTranslation
grep -r "useTranslation()" src/

# Trouver les clés avec point (ancien format)
grep -r "t('.*\..*')" src/
```

## ✅ Validation finale

Après migration d'un composant :

1. **Vérification visuelle**
   - Tous les textes s'affichent correctement
   - Le changement de langue fonctionne en temps réel
   - Pas de clés brutes affichées (comme `navigation:home`)

2. **Vérification console**
   - Pas d'erreurs i18next
   - Pas de warnings de clés manquantes
   - Les logs de debug sont propres

3. **Tests fonctionnels**
   - Changer la langue et vérifier tous les textes
   - Vérifier les dates (format FR vs EN)
   - Vérifier les nombres (séparateurs FR vs EN)
   - Vérifier les devises

## 🆘 Problèmes courants

### Clé non trouvée

```
Error: i18next::translator: missingKey en course unknownKey
```

**Solution** : Vérifier que la clé existe dans `/locales/en/course.json`

### Namespace non chargé

```
Error: Namespace 'myNamespace' is not loaded
```

**Solution** : Ajouter le namespace dans `/config/i18n.ts`

### Texte non traduit après changement de langue

**Solution** : Le composant n'utilise probablement pas `useI18n()`. Vérifier l'import.

---

**Note** : L'ancien système (`/lib/i18n.ts`) peut rester en place temporairement pendant la migration progressive. Une fois tous les composants migrés, il pourra être supprimé.
