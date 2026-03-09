import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useI18n } from '../../hooks/useI18n';
import { LanguageSwitcher, CompactLanguageSwitcher, FlagLanguageSwitcher } from '../i18n/LanguageSwitcher';
import { 
  Globe, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface I18nDemoPageProps {
  onNavigate: (path: string) => void;
}

export function I18nDemoPage({ onNavigate }: I18nDemoPageProps) {
  const { 
    t, 
    currentLanguage, 
    changeLanguage,
    formatDate, 
    formatTime, 
    formatDateTime,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatDuration,
    userTimezone,
    isRTL
  } = useI18n();

  // Dates de démonstration
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Données de démonstration
  const mockCourse = {
    title: currentLanguage === 'fr' ? 'React Avancé' : 'Advanced React',
    students: 1234,
    price: 99.99,
    rating: 4.8,
    completionRate: 85.5,
    duration: 180, // minutes
    publishedAt: new Date('2025-01-15'),
    updatedAt: yesterday,
    nextSession: tomorrow,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">
            <Globe className="w-3 h-3 mr-1" />
            {t('common:demo', { defaultValue: 'i18n Demo' })}
          </Badge>
          <h1 className="mb-4">
            {currentLanguage === 'fr' 
              ? 'Démonstration du système i18n' 
              : 'i18n System Demonstration'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {currentLanguage === 'fr'
              ? 'Cette page démontre toutes les fonctionnalités du système d\'internationalisation de Stream Éducatif'
              : 'This page demonstrates all the features of the Stream Educational internationalization system'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <Badge variant="secondary">
              {t('common:currentLanguage', { defaultValue: 'Current Language' })}: {currentLanguage.toUpperCase()}
            </Badge>
            <Badge variant="secondary">
              {t('common:timezone', { defaultValue: 'Timezone' })}: {userTimezone}
            </Badge>
            <Badge variant="secondary">
              {t('common:direction', { defaultValue: 'Direction' })}: {isRTL ? 'RTL' : 'LTR'}
            </Badge>
          </div>
        </div>

        {/* Language Switchers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('common:languageSwitchers', { defaultValue: 'Language Switchers' })}
            </CardTitle>
            <CardDescription>
              {currentLanguage === 'fr'
                ? 'Différents styles de sélecteurs de langue disponibles'
                : 'Different language switcher styles available'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm">{currentLanguage === 'fr' ? 'Standard' : 'Standard'}</label>
                <LanguageSwitcher variant="outline" showLabel />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm">{currentLanguage === 'fr' ? 'Icône' : 'Icon'}</label>
                <LanguageSwitcher variant="outline" size="icon" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm">{currentLanguage === 'fr' ? 'Compact' : 'Compact'}</label>
                <CompactLanguageSwitcher />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm">{currentLanguage === 'fr' ? 'Drapeaux' : 'Flags'}</label>
                <FlagLanguageSwitcher />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-2">
              <Button 
                variant={currentLanguage === 'fr' ? 'default' : 'outline'}
                onClick={() => changeLanguage('fr')}
              >
                🇫🇷 Français
              </Button>
              <Button 
                variant={currentLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => changeLanguage('en')}
              >
                🇬🇧 English
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Date & Time Formatting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t('common:dateTime', { defaultValue: 'Date & Time' })}
              </CardTitle>
              <CardDescription>
                {currentLanguage === 'fr'
                  ? 'Formatage automatique selon la locale'
                  : 'Automatic locale-based formatting'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">{currentLanguage === 'fr' ? 'Date' : 'Date'}:</div>
                <div className="text-muted-foreground">{formatDate(now)}</div>
                
                <div className="font-medium">{currentLanguage === 'fr' ? 'Heure' : 'Time'}:</div>
                <div className="text-muted-foreground">{formatTime(now)}</div>
                
                <div className="font-medium">{currentLanguage === 'fr' ? 'Date & Heure' : 'DateTime'}:</div>
                <div className="text-muted-foreground">{formatDateTime(now)}</div>
                
                <div className="font-medium">{currentLanguage === 'fr' ? 'Date complète' : 'Full date'}:</div>
                <div className="text-muted-foreground">{formatDate(now, { dateStyle: 'full' })}</div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">{currentLanguage === 'fr' ? 'Temps relatif' : 'Relative time'}:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'fr' ? 'Hier' : 'Yesterday'}:</span>
                    <span className="text-muted-foreground">{formatRelativeTime(yesterday)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'fr' ? 'Demain' : 'Tomorrow'}:</span>
                    <span className="text-muted-foreground">{formatRelativeTime(tomorrow)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{currentLanguage === 'fr' ? 'Semaine prochaine' : 'Next week'}:</span>
                    <span className="text-muted-foreground">{formatRelativeTime(nextWeek)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Number & Currency Formatting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t('common:numbersAndCurrency', { defaultValue: 'Numbers & Currency' })}
              </CardTitle>
              <CardDescription>
                {currentLanguage === 'fr'
                  ? 'Formatage des nombres selon la locale'
                  : 'Locale-based number formatting'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">{currentLanguage === 'fr' ? 'Nombre' : 'Number'}:</div>
                <div className="text-muted-foreground">{formatNumber(1234567.89)}</div>
                
                <div className="font-medium">Euro (EUR):</div>
                <div className="text-muted-foreground">{formatCurrency(99.99, 'EUR')}</div>
                
                <div className="font-medium">Dollar (USD):</div>
                <div className="text-muted-foreground">{formatCurrency(99.99, 'USD')}</div>
                
                <div className="font-medium">{currentLanguage === 'fr' ? 'Pourcentage' : 'Percentage'}:</div>
                <div className="text-muted-foreground">{formatPercent(85.5, 1)}</div>
                
                <div className="font-medium">{currentLanguage === 'fr' ? 'Durée' : 'Duration'}:</div>
                <div className="text-muted-foreground">{formatDuration(135)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('common:translations', { defaultValue: 'Translations' })}
              </CardTitle>
              <CardDescription>
                {currentLanguage === 'fr'
                  ? 'Exemples de traductions avec namespaces'
                  : 'Translation examples with namespaces'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('common:loading')</code>
                  <div className="mt-1">{t('common:loading')}</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('auth:signin')</code>
                  <div className="mt-1">{t('auth:signin')}</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('course:title')</code>
                  <div className="mt-1">{t('course:title')}</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('navigation:home')</code>
                  <div className="mt-1">{t('navigation:home')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interpolation & Pluralization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {currentLanguage === 'fr' ? 'Interpolation & Pluralisation' : 'Interpolation & Pluralization'}
              </CardTitle>
              <CardDescription>
                {currentLanguage === 'fr'
                  ? 'Variables dynamiques et pluriels automatiques'
                  : 'Dynamic variables and automatic plurals'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('course:studentsCount', {'{'} count: 1 {'}'})</code>
                  <div className="mt-1">{t('course:studentsCount', { count: 1 })}</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('course:studentsCount', {'{'} count: 5 {'}'})</code>
                  <div className="mt-1">{t('course:studentsCount', { count: 5 })}</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <code className="text-xs">t('course:lecturesCount', {'{'} count: 12 {'}'})</code>
                  <div className="mt-1">{t('course:lecturesCount', { count: 12 })}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-world Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {currentLanguage === 'fr' ? 'Exemple réel : Card de cours' : 'Real-world Example: Course Card'}
            </CardTitle>
            <CardDescription>
              {currentLanguage === 'fr'
                ? 'Démonstration avec toutes les fonctionnalités i18n'
                : 'Demonstration with all i18n features'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-gradient-to-br from-card to-muted/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{mockCourse.title}</h3>
                  <Badge variant="secondary">{t('course:level')}: {t('course:intermediate')}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(mockCourse.price, 'EUR')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('course:free', { defaultValue: 'or free with subscription' })}
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('course:studentsCount', { count: mockCourse.students })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('course:duration')}: {formatDuration(mockCourse.duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('course:rating')}: {mockCourse.rating}/5
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('course:progress')}: {formatPercent(mockCourse.completionRate, 1)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                <div>{t('course:publishedDate')}: {formatDate(mockCourse.publishedAt)}</div>
                <div>{t('course:lastUpdated')}: {formatRelativeTime(mockCourse.updatedAt)}</div>
                <div>{t('course:nextSession')}: {formatDateTime(mockCourse.nextSession)}</div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">
                  {t('course:enroll')}
                </Button>
                <Button variant="outline">
                  {t('course:preview')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => onNavigate('/')}>
            {t('common:back')} {t('navigation:home')}
          </Button>
        </div>
      </div>
    </div>
  );
}
