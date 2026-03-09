import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Smartphone, 
  Download, 
  Star, 
  Play,
  Apple,
  Shield,
  Zap,
  Users,
  BookOpen,
  Bell,
  Wifi,
  Heart,
  MessageSquare,
  Check
} from 'lucide-react';

interface MobileAppPageProps {
  onNavigate: (path: string) => void;
}

export function MobileAppPage({ onNavigate }: MobileAppPageProps) {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Apprentissage Hors-ligne',
      description: 'Téléchargez vos cours pour apprendre partout, même sans connexion internet',
      details: 'Synchronisation automatique une fois reconnecté'
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Notifications Intelligentes',
      description: 'Recevez des rappels personnalisés pour vos sessions et objectifs',
      details: 'Notifications push pour ne manquer aucune session live'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Performance Optimisée',
      description: 'Interface native ultra-rapide optimisée pour mobile',
      details: 'Chargement instantané et navigation fluide'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sécurité Renforcée',
      description: 'Authentification biométrique et données chiffrées',
      details: 'Protection maximale de vos données personnelles'
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '500K+', label: 'Téléchargements' },
    { icon: <Star className="w-6 h-6" />, value: '4.8', label: 'Note App Store' },
    { icon: <Play className="w-6 h-6" />, value: '50K+', label: 'Heures de contenu' },
    { icon: <Heart className="w-6 h-6" />, value: '98%', label: 'Satisfaction' }
  ];

  const screenshots = [
    {
      title: 'Dashboard Étudiant',
      description: 'Suivez votre progression en un coup d\'œil',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600'
    },
    {
      title: 'Cours Interactifs',
      description: 'Apprenez avec des vidéos HD et exercices',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=600'
    },
    {
      title: 'Sessions Live',
      description: 'Participez aux cours en direct',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                🎉 Nouvelle version disponible
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Stream Éducatif
                <span className="block text-blue-200">sur Mobile</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Apprenez partout, à tout moment avec notre application mobile. 
                Accédez à plus de 1000 cours depuis votre smartphone ou tablette.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 flex items-center"
                  onClick={() => window.open('https://apps.apple.com', '_blank')}
                >
                  <Apple className="w-6 h-6 mr-2" />
                  App Store
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10 flex items-center"
                  onClick={() => window.open('https://play.google.com', '_blank')}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Google Play
                </Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center text-blue-200 mb-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-96 bg-black rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <Smartphone className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg font-semibold">Stream Éducatif</p>
                      <p className="text-sm opacity-80">Version Mobile</p>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-orange-500 text-white p-2 rounded-full">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Fonctionnalités Exclusives Mobile
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez pourquoi plus de 500,000 apprenants choisissent notre app mobile
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all ${
                    activeFeature === index ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        activeFeature === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground mb-2">{feature.description}</p>
                        {activeFeature === index && (
                          <p className="text-sm text-primary font-medium">
                            {feature.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="text-center">
                    <div className="w-48 h-96 bg-gray-200 rounded-2xl overflow-hidden mb-4 mx-auto">
                      <img 
                        src={screenshot.image} 
                        alt={screenshot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-semibold mb-1">{screenshot.title}</h4>
                    <p className="text-sm text-muted-foreground">{screenshot.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <div className="flex items-center justify-center space-x-2 mb-8">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xl font-semibold ml-2">4.8/5</span>
              <span className="text-muted-foreground">(2,347 avis)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Martin',
                role: 'Développeuse Frontend',
                comment: 'L\'app mobile me permet d\'apprendre pendant mes trajets. Interface parfaite et contenu de qualité !',
                rating: 5
              },
              {
                name: 'Alexandre Dubois',
                role: 'Étudiant en Marketing',
                comment: 'Les notifications m\'aident à rester motivé. J\'ai terminé 3 cours ce mois-ci grâce à l\'app.',
                rating: 5
              },
              {
                name: 'Marie Rodriguez',
                role: 'Chef de Projet',
                comment: 'Parfait pour la formation continue. Je peux suivre mes cours même en déplacement professionnel.',
                rating: 5
              }
            ].map((review, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${
                          star <= review.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{review.comment}"
                  </p>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-sm text-muted-foreground">{review.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Commencez dès aujourd'hui
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Rejoignez les milliers d'apprenants qui développent leurs compétences 
                avec Stream Éducatif Mobile
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100"
                  onClick={() => window.open('https://apps.apple.com', '_blank')}
                >
                  <Apple className="w-6 h-6 mr-2" />
                  Télécharger sur App Store
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/50 text-white hover:bg-white/20 hover:border-white/70 font-semibold shadow-lg px-6 py-3"
                  onClick={() => window.open('https://play.google.com', '_blank')}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Obtenir sur Google Play
                </Button>
              </div>

              <p className="text-sm text-blue-200">
                Gratuit • Compatible iOS 14+ et Android 8+ • Français & English
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}