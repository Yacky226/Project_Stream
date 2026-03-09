# 📝 i18n Cheat Sheet - Stream Éducatif

Quick reference pour le système d'internationalisation

---

## 🚀 Import de base

```tsx
import { useI18n } from '../../hooks/useI18n';
```

---

## 📖 Traduction de texte

```tsx
const { t } = useI18n();

// Basique avec namespace
t('common:loading')
t('auth:signin')
t('course:title')
t('navigation:home')

// Avec interpolation
t('common:welcome', { name: 'Alice' })
t('course:price', { amount: 99 })

// Avec pluralisation
t('course:studentsCount', { count: 1 })   // "1 étudiant"
t('course:studentsCount', { count: 5 })   // "5 étudiants"

// Avec valeur par défaut
t('newKey', { defaultValue: 'Fallback text' })
```

---

## 📅 Dates et heures

```tsx
const { formatDate, formatTime, formatDateTime, formatRelativeTime } = useI18n();

// Date seulement
formatDate(new Date())                        // "2 janv. 2026"
formatDate(new Date(), { dateStyle: 'full' }) // "vendredi 2 janvier 2026"

// Heure seulement
formatTime(new Date())                        // "14:30"
formatTime(new Date(), { hour12: true })      // "2:30 PM"

// Date + Heure
formatDateTime(new Date())                    // "2 janv. 2026, 14:30"

// Temps relatif
formatRelativeTime(yesterday)                 // "il y a 1 jour"
formatRelativeTime(tomorrow)                  // "dans 1 jour"
```

---

## 🔢 Nombres et devises

```tsx
const { formatNumber, formatCurrency, formatPercent, formatDuration } = useI18n();

// Nombres
formatNumber(1234.56)                         // "1 234,56" (FR) / "1,234.56" (EN)

// Devises
formatCurrency(99.99, 'EUR')                  // "99,99 €"
formatCurrency(99.99, 'USD')                  // "99,99 $US"

// Pourcentages
formatPercent(75)                             // "75 %"
formatPercent(85.5, 1)                        // "85,5 %"

// Durées (en minutes)
formatDuration(45)                            // "45m"
formatDuration(90)                            // "1h 30m"
formatDuration(120)                           // "2h"
```

---

## 🌍 Changement de langue

```tsx
const { currentLanguage, changeLanguage } = useI18n();

// Obtenir la langue actuelle
console.log(currentLanguage);  // 'fr' ou 'en'

// Changer la langue
changeLanguage('fr');          // Français
changeLanguage('en');          // English
```

---

## 🎨 Composants UI

```tsx
import { 
  LanguageSwitcher, 
  CompactLanguageSwitcher, 
  FlagLanguageSwitcher 
} from '../../components/i18n/LanguageSwitcher';

// Dropdown complet
<LanguageSwitcher variant="ghost" size="sm" />

// Avec label
<LanguageSwitcher variant="ghost" showLabel />

// Icône seulement
<LanguageSwitcher variant="ghost" size="icon" />

// Toggle simple
<CompactLanguageSwitcher />

// Avec drapeaux
<FlagLanguageSwitcher />
```

---

## 📚 Namespaces disponibles

| Namespace | Utilisation | Exemple |
|-----------|-------------|---------|
| `common` | Textes généraux | `t('common:loading')` |
| `auth` | Authentification | `t('auth:signin')` |
| `course` | Cours | `t('course:enroll')` |
| `navigation` | Navigation | `t('navigation:home')` |
| `home` | Page d'accueil | `t('home:hero.title')` |
| `video` | Lecteur vidéo | `t('video:play')` |
| `dashboard` | Tableaux de bord | `t('dashboard:welcome')` |
| `chat` | Chat/Messages | `t('chat:sendMessage')` |
| `footer` | Footer | `t('footer:newsletter.title')` |

---

## 🔑 Clés fréquemment utilisées

### Common
```tsx
t('common:loading')
t('common:error')
t('common:success')
t('common:save')
t('common:cancel')
t('common:delete')
t('common:search')
```

### Auth
```tsx
t('auth:signin')
t('auth:signup')
t('auth:email')
t('auth:password')
t('auth:logout')
```

### Course
```tsx
t('course:title')
t('course:enroll')
t('course:students')
t('course:duration')
t('course:free')
```

### Navigation
```tsx
t('navigation:home')
t('navigation:catalog')
t('navigation:search')
t('navigation:profile')
```

---

## ⚡ Raccourcis et astuces

### Hook complet
```tsx
const { 
  t,                    // Traduction
  currentLanguage,      // Langue actuelle
  changeLanguage,       // Changer langue
  formatDate,           // Formatter date
  formatTime,           // Formatter heure
  formatDateTime,       // Formatter date+heure
  formatRelativeTime,   // Temps relatif
  formatNumber,         // Formatter nombre
  formatCurrency,       // Formatter devise
  formatPercent,        // Formatter pourcentage
  formatDuration,       // Formatter durée
  userTimezone,         // Fuseau horaire utilisateur
  isRTL,                // Direction RTL ?
} = useI18n();
```

### Interpolation avancée
```tsx
// Plusieurs variables
t('message', { name: 'Alice', age: 25 })

// Avec formatage
t('enrolled', { 
  count: 1234,
  date: formatDate(new Date()) 
})
```

### Pluralisation complexe
```tsx
// Dans le JSON
{
  "itemsCount": "{{count}} item",
  "itemsCount_plural": "{{count}} items",
  "itemsCount_zero": "No items"
}

// Utilisation
t('itemsCount', { count: 0 })  // "No items"
t('itemsCount', { count: 1 })  // "1 item"
t('itemsCount', { count: 5 })  // "5 items"
```

---

## 🐛 Debugging

```tsx
// Obtenir l'objet i18n complet
const { i18n } = useI18n();

// Vérifier si une clé existe
i18n.exists('common:loading')  // true/false

// Obtenir toutes les langues chargées
i18n.languages  // ['en', 'fr']

// Recharger les traductions
i18n.reloadResources()
```

---

## ✅ Checklist composant

```markdown
Lors de la création d'un nouveau composant :

- [ ] Importer `useI18n`
- [ ] Utiliser `t()` pour tous les textes
- [ ] Utiliser `:` pour les namespaces (`common:loading`)
- [ ] Utiliser `formatDate()` pour les dates
- [ ] Utiliser `formatCurrency()` pour les prix
- [ ] Traduire les `aria-label`
- [ ] Tester avec FR et EN
- [ ] Vérifier les pluriels si applicable
```

---

## 🎯 Patterns courants

### Card de cours
```tsx
function CourseCard({ course }) {
  const { t, formatCurrency, formatDate } = useI18n();
  
  return (
    <div>
      <h3>{course.title}</h3>
      <p>{t('course:studentsCount', { count: course.students })}</p>
      <span>{formatCurrency(course.price, 'EUR')}</span>
      <time>{formatDate(course.createdAt)}</time>
      <button>{t('course:enroll')}</button>
    </div>
  );
}
```

### Stats Dashboard
```tsx
function Stats({ data }) {
  const { t, formatNumber, formatPercent } = useI18n();
  
  return (
    <div>
      <div>
        <h4>{t('dashboard:student.totalCourses')}</h4>
        <p>{formatNumber(data.courses)}</p>
      </div>
      <div>
        <h4>{t('dashboard:student.progress')}</h4>
        <p>{formatPercent(data.completion)}</p>
      </div>
    </div>
  );
}
```

### Bouton avec action
```tsx
<Button 
  onClick={handleSubmit}
  aria-label={t('common:submit')}
>
  {t('common:submit')}
</Button>
```

---

## 📱 Support responsive

```tsx
// Texte différent selon l'écran
<span className="hidden sm:inline">{t('common:completeText')}</span>
<span className="sm:hidden">{t('common:shortText')}</span>

// Avec LanguageSwitcher
<div className="hidden md:block">
  <LanguageSwitcher showLabel />
</div>
<div className="md:hidden">
  <CompactLanguageSwitcher />
</div>
```

---

## 🔗 Liens utiles

- **Documentation complète** : `/I18N_GUIDE.md`
- **Migration** : `/I18N_MIGRATION.md`
- **Récapitulatif** : `/I18N_README.md`
- **react-i18next** : https://react.i18next.com/

---

## ⚠️ Erreurs courantes

### ❌ Mauvais
```tsx
t('common.loading')           // Point au lieu de deux-points
t('loading')                  // Pas de namespace
getCurrentLanguage()          // Fonction inexistante
setLanguage('fr')            // Fonction inexistante
```

### ✅ Correct
```tsx
t('common:loading')           // Deux-points pour namespace
t('common:loading')           // Namespace obligatoire
currentLanguage               // Propriété
changeLanguage('fr')          // Bonne fonction
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2 janvier 2026

💡 **Astuce** : Gardez cette fiche à portée de main pendant le développement !
