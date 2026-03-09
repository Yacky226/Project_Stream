import { useTranslation } from '../../lib/i18n';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const { t } = useTranslation();
  
  const suggestions = [
    {
      title: 'Accueil',
      description: 'Retourner à la page d\'accueil',
      path: '/',
      icon: '🏠'
    },
    {
      title: 'Catalogue de cours',
      description: 'Découvrir tous nos cours',
      path: '/catalog',
      icon: '📚'
    },
    {
      title: 'Sessions en direct',
      description: 'Voir les sessions live',
      path: '/live-sessions',
      icon: '🎥'
    },
    {
      title: 'Aide',
      description: 'Centre d\'aide et FAQ',
      path: '/help',
      icon: '❓'
    }
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center max-w-2xl">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🔍</div>
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-3xl font-semibold mb-4">Page non trouvée</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Voici quelques suggestions pour continuer votre navigation.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {suggestions.map((suggestion) => (
            <Card 
              key={suggestion.path}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onNavigate(suggestion.path)}
            >
              <div className="text-3xl mb-3">{suggestion.icon}</div>
              <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                {suggestion.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {suggestion.description}
              </p>
            </Card>
          ))}
        </div>
        
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => onNavigate('/')}
            className="min-w-[140px]"
          >
            {t('common.home')}
          </Button>
          <Button 
            variant="outline"
            size="lg"
            onClick={() => onNavigate('/catalog')}
            className="min-w-[140px]"
          >
            {t('nav.catalog')}
          </Button>
          <Button 
            variant="ghost"
            size="lg"
            onClick={() => window.history.back()}
            className="min-w-[140px]"
          >
            ← Retour
          </Button>
        </div>
        
        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            Vous cherchiez quelque chose de spécifique ?
          </p>
          <Button 
            variant="outline"
            onClick={() => onNavigate('/search')}
          >
            🔍 Rechercher dans le catalogue
          </Button>
        </div>
        
        {/* Help Link */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ? {' '}
            <button 
              onClick={() => onNavigate('/contact')}
              className="text-primary hover:underline font-medium"
            >
              Contactez notre support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}