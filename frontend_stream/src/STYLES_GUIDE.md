# Guide de Conversion Tailwind vers CSS Pur

## Structure des Fichiers CSS

Tous les styles CSS sont organisés dans `/styles/components/`:
- `header.css` - Styles du header
- `footer.css` - Styles du footer
- `homepage.css` - Styles de la page d'accueil
- (À créer pour d'autres composants)

## Méthodologie BEM (Block Element Modifier)

Nous utilisons la convention BEM pour nommer les classes CSS :
- **Block** : `.component-name`
- **Element** : `.component-name__element`
- **Modifier** : `.component-name__element--modifier`

### Exemples :
```css
/* Block */
.header { }

/* Elements */
.header__logo { }
.header__nav { }
.header__button { }

/* Modifiers */
.header__button--primary { }
.header__button--active { }
```

## Table de Conversion Tailwind → CSS

### Layout & Flexbox
```
Tailwind              →  CSS Pure
----------------------------------------
flex                  →  display: flex;
items-center          →  align-items: center;
justify-between       →  justify-content: space-between;
justify-center        →  justify-content: center;
flex-col              →  flex-direction: column;
flex-row              →  flex-direction: row;
gap-4                 →  gap: 1rem;
gap-2                 →  gap: 0.5rem;
```

### Spacing
```
p-4                   →  padding: 1rem;
px-4                  →  padding-left: 1rem; padding-right: 1rem;
py-2                  →  padding-top: 0.5rem; padding-bottom: 0.5rem;
m-4                   →  margin: 1rem;
mb-4                  →  margin-bottom: 1rem;
```

### Colors
```
bg-primary            →  background-color: var(--color-primary);
text-white            →  color: white;
text-foreground       →  color: var(--color-foreground);
border-border         →  border-color: var(--color-border);
```

### Typography
```
text-lg               →  font-size: var(--text-lg);
text-xl               →  font-size: var(--text-xl);
font-bold             →  font-weight: 700;
font-semibold         →  font-weight: 600;
```

### Borders & Radius
```
rounded-lg            →  border-radius: var(--radius-lg);
rounded-md            →  border-radius: var(--radius-md);
border                →  border: 1px solid var(--color-border);
```

### Effects
```
shadow-lg             →  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
hover:opacity-80      →  .class:hover { opacity: 0.8; }
transition-all        →  transition: all 0.2s;
```

### Responsive
```
sm:flex               →  @media (min-width: 640px) { display: flex; }
md:grid-cols-2        →  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
lg:px-8               →  @media (min-width: 1024px) { padding-left: 2rem; padding-right: 2rem; }
```

## Breakpoints
```
xs: 475px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Variables CSS Disponibles

### Couleurs
```css
var(--color-primary)
var(--color-secondary)
var(--color-background)
var(--color-foreground)
var(--color-muted)
var(--color-muted-foreground)
var(--color-border)
var(--color-accent)
var(--color-destructive)
var(--color-success)
var(--color-warning)
var(--color-error)
var(--color-info)
```

### Tailles de Texte
```css
var(--text-xs)    /* 0.75rem */
var(--text-sm)    /* 0.875rem */
var(--text-base)  /* 1rem */
var(--text-lg)    /* 1.125rem */
var(--text-xl)    /* 1.25rem */
var(--text-2xl)   /* 1.5rem */
var(--text-3xl)   /* 1.875rem */
var(--text-4xl)   /* 2.25rem */
var(--text-5xl)   /* 3rem */
var(--text-6xl)   /* 3.75rem */
```

### Radius
```css
var(--radius-sm)
var(--radius-md)
var(--radius-lg)
var(--radius-xl)
```

## Exemple de Conversion : HomePage Hero Section

### AVANT (Tailwind):
```tsx
<section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
  <div className="container mx-auto px-4 py-8 relative z-10">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          {t('home.hero.title')}
        </h1>
      </div>
    </div>
  </div>
</section>
```

### APRÈS (CSS Pur):
```tsx
<section className="home-hero">
  <div className="home-hero__container">
    <div className="home-hero__grid">
      <div className="home-hero__content">
        <h1 className="home-hero__title">
          {t('home.hero.title')}
        </h1>
      </div>
    </div>
  </div>
</section>
```

```css
/* homepage.css */
.home-hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.home-hero__container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 10;
}

.home-hero__grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 1024px) {
  .home-hero__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.home-hero__content {
  text-align: center;
}

@media (min-width: 1024px) {
  .home-hero__content {
    text-align: left;
  }
}

.home-hero__title {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .home-hero__title {
    font-size: 3rem;
  }
}

@media (min-width: 1024px) {
  .home-hero__title {
    font-size: 3.75rem;
  }
}
```

## Composants Déjà Convertis

✅ **Header** (`/components/layout/HeaderRedux.tsx`)
- Classes disponibles dans `/styles/components/header.css`

✅ **Footer** (`/components/layout/Footer.tsx`)
- Classes disponibles dans `/styles/components/footer.css`

✅ **HomePage** (`/components/pages/HomePage.tsx`)
- Classes disponibles dans `/styles/components/homepage.css`

## Composants à Convertir

Les composants suivants utilisent encore Tailwind et doivent être convertis :
- StudentDashboard
- TeacherDashboard
- AdminDashboard
- CourseCatalog
- CourseDetail
- VideoPlayer
- Et tous les autres composants...

## Processus de Conversion

1. **Créer le fichier CSS** dans `/styles/components/[component-name].css`
2. **Définir les classes BEM** pour tous les éléments du composant
3. **Convertir les classes Tailwind** en CSS pur en utilisant les variables
4. **Mettre à jour le composant React** pour utiliser les nouvelles classes
5. **Importer le CSS** dans `/styles/globals.css`
6. **Tester** que le style visuel reste identique

## Bonnes Pratiques

1. **Garder la même hiérarchie visuelle** - Le design ne doit pas changer
2. **Utiliser les variables CSS** - Ne pas hardcoder les valeurs
3. **Respecter le mode sombre** - Utiliser les variables qui s'adaptent
4. **Rester mobile-first** - Définir les styles mobile d'abord, puis les media queries
5. **Grouper les styles par fonctionnalité** - Garder une organisation claire

## Support du Mode Sombre

Les variables CSS changent automatiquement avec la classe `.dark` sur l'élément `html`.
Pas besoin de définir des styles spécifiques pour le mode sombre si vous utilisez les variables.

```css
/* ✅ Bon - S'adapte automatiquement */
.header {
  background-color: var(--color-background);
  color: var(--color-foreground);
}

/* ❌ Mauvais - Ne s'adapte pas */
.header {
  background-color: #ffffff;
  color: #000000;
}
```
