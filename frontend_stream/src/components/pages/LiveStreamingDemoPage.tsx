import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Video, 
  Users, 
  MessageSquare, 
  Hand,
  Monitor,
  Mic,
  Settings,
  Play,
  Eye,
  Radio,
  ArrowRight,
  Zap,
  Shield,
  Volume2,
  Activity
} from 'lucide-react';

interface LiveStreamingDemoPageProps {
  onNavigate: (path: string) => void;
}

export function LiveStreamingDemoPage({ onNavigate }: LiveStreamingDemoPageProps) {
  const features = [
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Streaming HD en temps réel',
      description: 'Diffusion vidéo haute définition avec contrôles audio/vidéo avancés'
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: 'Partage d\'écran intégré',
      description: 'Partagez votre écran facilement pour montrer du code ou des présentations'
    },
    {
      icon: <Hand className="w-6 h-6" />,
      title: 'Système de main levée',
      description: 'Gestion intelligent des demandes de parole avec priorisation'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Chat en temps réel',
      description: 'Chat interactif avec modération, réactions et questions prioritaires'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Contrôles audio avancés',
      description: 'Gestion du micro avec suppression de bruit et contrôle automatique du gain'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Modération complète',
      description: 'Outils de modération pour gérer les participants et le contenu'
    }
  ];

  const demoSessions = [
    {
      id: 'react-hooks',
      title: 'React Hooks Avancés',
      teacher: 'Sarah Martin',
      status: 'live' as const,
      viewers: 47,
      duration: '15:30',
      thumbnail: '🚀'
    },
    {
      id: 'typescript-masterclass',
      title: 'TypeScript Masterclass',
      teacher: 'Pierre Dupont',
      status: 'starting' as const,
      viewers: 23,
      duration: '02:15',
      thumbnail: '⚡'
    },
    {
      id: 'nodejs-api',
      title: 'API Node.js avec Express',
      teacher: 'Marie Chen',
      status: 'scheduled' as const,
      viewers: 0,
      duration: '00:00',
      thumbnail: '🔧'
    }
  ];

  const getStatusBadge = (status: 'live' | 'starting' | 'scheduled') => {
    switch (status) {
      case 'live':
        return <Badge variant="destructive" className="animate-pulse"><Radio className="w-3 h-3 mr-1" />EN DIRECT</Badge>;
      case 'starting':
        return <Badge variant="secondary"><Activity className="w-3 h-3 mr-1" />Démarrage</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Programmé</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Streaming Live Avancé</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Découvrez toutes les fonctionnalités avancées de notre plateforme de streaming éducatif
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            Temps réel
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Modération
          </Badge>
          <Badge variant="secondary" className="px-4 py-2">
            <Video className="w-4 h-4 mr-2" />
            HD 1080p
          </Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Fonctionnalités principales</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Sessions */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Sessions de démonstration</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          {demoSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                      {session.thumbnail}
                    </div>
                    <div>
                      <CardTitle className="text-base">{session.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">avec {session.teacher}</p>
                    </div>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {session.viewers} spectateurs
                    </div>
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      {session.duration}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onNavigate(`/courses/${session.id}/live/advanced`)}
                    disabled={session.status === 'scheduled'}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Rejoindre (Étudiant)
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onNavigate(`/teacher/live/advanced/${session.id}/demo`)}
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Access */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Teacher Demo */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-6 h-6 mr-3 text-primary" />
              Mode Enseignant
            </CardTitle>
            <p className="text-muted-foreground">
              Découvrez tous les outils de streaming et de modération
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Monitor className="w-4 h-4 mr-2 text-green-600" />
                Partage d'écran intégré
              </div>
              <div className="flex items-center text-sm">
                <Hand className="w-4 h-4 mr-2 text-blue-600" />
                Gestion des mains levées
              </div>
              <div className="flex items-center text-sm">
                <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                Modération du chat
              </div>
              <div className="flex items-center text-sm">
                <Settings className="w-4 h-4 mr-2 text-orange-600" />
                Contrôles avancés
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => onNavigate('/teacher/live/advanced/react-hooks/demo')}
            >
              Accéder au studio
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Student Demo */}
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-6 h-6 mr-3 text-secondary-foreground" />
              Mode Étudiant
            </CardTitle>
            <p className="text-muted-foreground">
              Expérience immersive d'apprentissage en direct
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Hand className="w-4 h-4 mr-2 text-green-600" />
                Lever la main pour poser des questions
              </div>
              <div className="flex items-center text-sm">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                Chat interactif avec réactions
              </div>
              <div className="flex items-center text-sm">
                <Volume2 className="w-4 h-4 mr-2 text-purple-600" />
                Contrôles audio personnalisés
              </div>
              <div className="flex items-center text-sm">
                <Activity className="w-4 h-4 mr-2 text-orange-600" />
                Interface optimisée
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onNavigate('/courses/react-hooks/live/advanced')}
            >
              Rejoindre la session
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Technical Features */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="text-center">Technologie de pointe</CardTitle>
          <p className="text-center text-muted-foreground">
            Architecture robuste pour une expérience de streaming optimale
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white mx-auto mb-3">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">WebRTC</h3>
              <p className="text-sm text-muted-foreground">Communication temps réel ultra-rapide</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Sécurisé</h3>
              <p className="text-sm text-muted-foreground">Chiffrement bout en bout</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Performance</h3>
              <p className="text-sm text-muted-foreground">Latence ultra-faible</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Scalable</h3>
              <p className="text-sm text-muted-foreground">Jusqu'à 1000 participants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}