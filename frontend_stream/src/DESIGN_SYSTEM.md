# 🎨 Design System - Stream Éducatif

## Principes de Design

### 1. **Moderne & Épuré**
- Espaces blancs généreux
- Grilles claires et structurées
- Typographie hiérarchisée
- Couleurs subtiles et cohérentes

### 2. **Responsive First**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### 3. **Accessibilité**
- Contrastes WCAG AA
- Navigation clavier
- ARIA labels
- Focus visible

---

## 📐 Spacing System

```css
/* Utilisez ces espacements de manière cohérente */
--spacing-xs: 0.25rem;    /* 4px */
--spacing-sm: 0.5rem;     /* 8px */
--spacing-md: 1rem;       /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
--spacing-4xl: 6rem;      /* 96px */
```

### Application dans Tailwind

```tsx
// ❌ ÉVITER - Espacements incohérents
<div className="p-3 mb-5">

// ✅ UTILISER - Spacing system
<div className="p-4 mb-6">  // 1rem, 1.5rem
<div className="p-6 mb-8">  // 1.5rem, 2rem
```

---

## 📱 Layout Patterns

### Pattern 1: Page Container

```tsx
// Layout standard pour toutes les pages
<div className="min-h-screen bg-background">
  {/* Header est sticky */}
  
  {/* Main Content */}
  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
    <div className="max-w-7xl mx-auto">
      {/* Page content */}
    </div>
  </main>
  
  {/* Footer */}
</div>
```

### Pattern 2: Dashboard Layout

```tsx
<div className="min-h-screen bg-background">
  <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
    {/* Header Section - Responsive */}
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl">Titre</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2">Description</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Actions */}
        </div>
      </div>
    </div>

    {/* Content Grid - Responsive */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Cards */}
    </div>
  </main>
</div>
```

### Pattern 3: Two-Column Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
  {/* Main Content - 8 cols on desktop */}
  <div className="lg:col-span-8 space-y-6">
    {/* Main content cards */}
  </div>
  
  {/* Sidebar - 4 cols on desktop */}
  <div className="lg:col-span-4 space-y-6">
    {/* Sidebar content */}
  </div>
</div>
```

---

## 🎴 Card Design

### Standard Card

```tsx
<Card className="overflow-hidden transition-all hover:shadow-lg">
  <CardHeader className="border-b bg-muted/30">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle className="text-lg sm:text-xl">Titre</CardTitle>
        <CardDescription>Description courte</CardDescription>
      </div>
      {/* Action button */}
    </div>
  </CardHeader>
  <CardContent className="p-4 sm:p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Stats Card

```tsx
<Card className="overflow-hidden">
  <CardContent className="p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Label</p>
        <p className="text-2xl sm:text-3xl font-semibold mt-1">1,234</p>
      </div>
      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Course Card

```tsx
<Card className="overflow-hidden group hover:shadow-xl transition-all">
  <div className="aspect-video relative overflow-hidden">
    <ImageWithFallback
      src={thumbnail}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
    {/* Badges overlay */}
    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-2">
      <Badge variant="secondary">{level}</Badge>
      {isLive && <Badge variant="destructive">🔴 Live</Badge>}
    </div>
  </div>
  
  <CardContent className="p-4 sm:p-5">
    <h3 className="font-semibold text-base sm:text-lg line-clamp-2 mb-2">
      {title}
    </h3>
    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
      {description}
    </p>
    
    {/* Footer - Responsive */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="truncate">{instructor}</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">{rating}</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 📊 Responsive Grid Systems

### Course Grid

```tsx
// ❌ PAS RESPONSIVE
<div className="grid grid-cols-3 gap-4">

// ✅ RESPONSIVE
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
```

### Stats Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>
```

### Dashboard Grid

```tsx
<div className="space-y-6 lg:space-y-8">
  {/* Stats Row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Stats cards */}
  </div>
  
  {/* Main Content */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      {/* Primary content */}
    </div>
    <div className="space-y-6">
      {/* Sidebar content */}
    </div>
  </div>
</div>
```

---

## 🎯 Button Patterns

### Primary Actions

```tsx
// Mobile: Full width / Desktop: Auto width
<Button 
  size="lg"
  className="w-full sm:w-auto"
>
  Action Principale
</Button>
```

### Action Groups

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button variant="default" className="w-full sm:w-auto">
    Primaire
  </Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Secondaire
  </Button>
</div>
```

### Icon Buttons

```tsx
// Responsive size
<Button 
  size="icon" 
  variant="ghost"
  className="h-9 w-9 sm:h-10 sm:w-10"
  aria-label="Action"
>
  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
</Button>
```

---

## 📝 Typography Scale

### Headings - Responsive

```tsx
// Page Title
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
  Page Title
</h1>

// Section Title
<h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
  Section Title
</h2>

// Card Title
<h3 className="text-lg sm:text-xl font-semibold">
  Card Title
</h3>

// Subsection
<h4 className="text-base sm:text-lg font-medium">
  Subsection
</h4>
```

### Body Text

```tsx
// Large text
<p className="text-base sm:text-lg text-muted-foreground">
  Large body text
</p>

// Standard text
<p className="text-sm sm:text-base text-muted-foreground">
  Standard body text
</p>

// Small text
<p className="text-xs sm:text-sm text-muted-foreground">
  Small text
</p>
```

---

## 🖼️ Image Handling

### Responsive Images

```tsx
// Course Thumbnail
<div className="aspect-video relative overflow-hidden rounded-lg">
  <ImageWithFallback
    src={thumbnail}
    alt={title}
    className="w-full h-full object-cover"
  />
</div>

// Avatar
<Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
  <AvatarImage src={avatar} alt={name} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

---

## 📱 Mobile Navigation

### Bottom Actions (Mobile)

```tsx
<div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
  <div className="flex gap-2">
    <Button className="flex-1">Action 1</Button>
    <Button className="flex-1" variant="outline">Action 2</Button>
  </div>
</div>

// Add padding to content to avoid overlap
<div className="pb-20 lg:pb-0">
  {/* Content */}
</div>
```

### Mobile Menu

```tsx
// Hamburger menu for mobile
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="lg:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[280px] sm:w-[320px]">
    {/* Mobile navigation */}
  </SheetContent>
</Sheet>
```

---

## 🎨 Color Usage

### Status Colors

```tsx
// Success
<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
  Complété
</Badge>

// Warning
<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
  En cours
</Badge>

// Error
<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
  Échec
</Badge>

// Info
<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
  Information
</Badge>
```

---

## 📋 Form Layouts

### Single Column Form (Mobile-First)

```tsx
<form className="space-y-4 sm:space-y-6">
  <div className="space-y-2">
    <Label htmlFor="field">Label</Label>
    <Input id="field" className="w-full" />
  </div>
  
  {/* Two columns on desktop */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>First Name</Label>
      <Input />
    </div>
    <div className="space-y-2">
      <Label>Last Name</Label>
      <Input />
    </div>
  </div>
  
  {/* Actions */}
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
    <Button type="submit" className="w-full sm:w-auto">
      Submit
    </Button>
    <Button type="button" variant="outline" className="w-full sm:w-auto">
      Cancel
    </Button>
  </div>
</form>
```

---

## 🎭 Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center px-4">
  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center mb-4">
    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
  </div>
  <h3 className="text-lg sm:text-xl font-semibold mb-2">
    Aucun élément trouvé
  </h3>
  <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
    Description de l'état vide
  </p>
  <Button className="w-full sm:w-auto">
    Action
  </Button>
</div>
```

---

## 📊 Table Responsive

### Mobile: Cards / Desktop: Table

```tsx
{/* Desktop Table */}
<div className="hidden lg:block">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Column 1</TableHead>
        <TableHead>Column 2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map(item => (
        <TableRow key={item.id}>
          <TableCell>{item.col1}</TableCell>
          <TableCell>{item.col2}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>

{/* Mobile Cards */}
<div className="lg:hidden space-y-3">
  {data.map(item => (
    <Card key={item.id}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Column 1</span>
            <span className="font-medium">{item.col1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Column 2</span>
            <span className="font-medium">{item.col2}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

---

## ✨ Animation & Transitions

```tsx
// Hover effects
<Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

// Loading states
<div className="animate-pulse bg-muted rounded-lg h-48" />

// Fade in
<div className="animate-in fade-in duration-500">

// Slide in from bottom
<div className="animate-in slide-in-from-bottom-4 duration-500">
```

---

## 🎯 Best Practices Checklist

### Pour chaque page:

- [ ] Container avec max-width et padding responsive
- [ ] Grid/Flex layouts qui s'adaptent aux breakpoints
- [ ] Texte avec tailles responsives (text-base sm:text-lg)
- [ ] Boutons full-width sur mobile, auto sur desktop
- [ ] Images avec aspect-ratio et object-cover
- [ ] Espaces cohérents (p-4 sm:p-6 lg:p-8)
- [ ] Navigation adaptée (menu burger sur mobile)
- [ ] Formulaires en colonne sur mobile, grille sur desktop
- [ ] Tables → Cards sur mobile
- [ ] Touch targets minimum 44x44px
- [ ] Pas de scroll horizontal
- [ ] Contenu lisible sur toutes tailles d'écran

---

*Design System v1.0 - Stream Éducatif*
