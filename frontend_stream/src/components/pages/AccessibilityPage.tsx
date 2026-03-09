import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Accessibility, 
  Eye, 
  Ear, 
  Hand, 
  Brain, 
  Monitor, 
  Keyboard, 
  Mouse,
  Volume2,
  Type,
  Contrast,
  ZoomIn,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

interface AccessibilityPageProps {
  onNavigate: (path: string) => void;
}

export function AccessibilityPage({ onNavigate }: AccessibilityPageProps) {
  const { t } = useTranslation();

  const features = [
    {
      category: 'Vision',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      items: [
        'Support des lecteurs d\'écran (NVDA, JAWS, VoiceOver)',
        'Contraste élevé et thèmes sombres',
        'Tailles de police ajustables',
        'Navigation au clavier complète',
        'Descriptions alternatives pour les images',
        'Sous-titres pour toutes les vidéos'
      ]
    },
    {
      category: 'Audition',
      icon: Ear,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      items: [
        'Sous-titres automatiques et manuels',
        'Transcriptions complètes des cours',
        'Alertes visuelles pour les notifications',
        'Langue des signes pour les cours principaux',
        'Contrôle précis du volume',
        'Interface visuelle pour le chat vocal'
      ]
    },
    {
      category: 'Motricité',
      icon: Hand,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      items: [
        'Navigation complète au clavier',
        'Commandes vocales disponibles',
        'Boutons et zones cliquables élargis',
        'Temps de réaction prolongés',
        'Alternatives aux glisser-déposer',
        'Support des contacteurs externes'
      ]
    },
    {
      category: 'Cognition',
      icon: Brain,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      items: [
        'Interface simplifiée disponible',
        'Progression sauvegardée automatiquement',
        'Rappels et notifications personnalisables',
        'Vitesse de lecture ajustable',
        'Mode focus sans distractions',
        'Aide contextuelle omniprésente'
      ]
    }
  ];

  const standards = [
    {
      name: 'WCAG 2.1 AA',
      description: 'Conforme aux directives d\'accessibilité du contenu web',
      status: 'Certifié',
      level: 'AA'
    },
    {
      name: 'Section 508',
      description: 'Conforme aux standards d\'accessibilité américains',
      status: 'Conforme',
      level: 'Complet'
    },
    {
      name: 'EN 301 549',
      description: 'Standard européen d\'accessibilité numérique',
      status: 'Certifié',
      level: 'V3.2.1'
    },
    {
      name: 'RGAA 4.1',
      description: 'Référentiel général d\'amélioration de l\'accessibilité',
      status: 'Conforme',
      level: 'AA'
    }
  ];

  const tools = [
    {
      name: 'Lecteurs d\'écran',
      description: 'NVDA, JAWS, VoiceOver, TalkBack',
      icon: Volume2,
      compatibility: '100%'
    },
    {
      name: 'Navigation clavier',
      description: 'Toutes les fonctions accessibles au clavier',
      icon: Keyboard,
      compatibility: '100%'
    },
    {
      name: 'Loupes d\'écran',
      description: 'ZoomText, Loupe Windows, Zoom',
      icon: ZoomIn,
      compatibility: '100%'
    },
    {
      name: 'Contraste élevé',
      description: 'Thèmes et modes d\'affichage adaptés',
      icon: Contrast,
      compatibility: '100%'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Accessibility className="w-12 h-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold">Accessibilité</h1>
            </div>
            <p className="text-xl text-green-100 mb-6">
              Stream Éducatif s'engage à rendre l'apprentissage accessible à tous, 
              sans exception ni discrimination.
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white text-lg py-2 px-4">
              Conforme WCAG 2.1 AA
            </Badge>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Notre engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Nous croyons fermement que l'éducation est un droit universel. C'est pourquoi 
                  Stream Éducatif a été conçue dès le départ pour être accessible à tous les 
                  apprenants, quels que soient leurs besoins ou leurs capacités.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Notre plateforme respecte et dépasse les standards internationaux d'accessibilité 
                  numérique, et nous améliorons continuellement notre interface pour offrir 
                  une expérience d'apprentissage inclusive et enrichissante.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => onNavigate('/contact')}>
                    Signaler un problème d'accessibilité
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('/help')}>
                    Guide d'utilisation accessible
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features by Category */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités d'accessibilité
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    {feature.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Compliance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Conformité aux standards
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {standards.map((standard, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{standard.name}</CardTitle>
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      {standard.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {standard.description}
                    </p>
                    <p className="text-sm font-semibold">
                      Niveau : {standard.level}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Compatibility */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Compatibilité des outils d'assistance
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {tools.map((tool, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <tool.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        {tool.compatibility}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Report Issues */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
                  Signaler un problème d'accessibilité
                </CardTitle>
                <CardDescription>
                  Votre retour nous aide à améliorer continuellement notre plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Si vous rencontrez des difficultés d'accessibilité sur notre plateforme, 
                  nous vous encourageons vivement à nous le signaler. Votre retour est précieux 
                  pour nous aider à identifier et corriger rapidement tout problème.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Comment signaler :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Email : accessibilite@stream-educatif.fr</li>
                      <li>• Téléphone : +33 1 23 45 67 89</li>
                      <li>• Formulaire de contact en ligne</li>
                      <li>• Chat en direct sur la plateforme</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Informations utiles :</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Description détaillée du problème</li>
                      <li>• Page ou section concernée</li>
                      <li>• Navigateur et système utilisés</li>
                      <li>• Outils d'assistance utilisés</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => onNavigate('/contact')}>
                    Signaler un problème
                  </Button>
                  <Button variant="outline" onClick={() => onNavigate('/help')}>
                    Consulter l'aide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Improvements */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Nos prochaines améliorations</h2>
            <p className="text-muted-foreground mb-8">
              Nous continuons d'innover pour rendre notre plateforme encore plus accessible
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Type className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">IA de transcription</h3>
                  <p className="text-sm text-muted-foreground">
                    Transcription automatique améliorée avec ponctuation intelligente
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Personnalisation cognitive</h3>
                  <p className="text-sm text-muted-foreground">
                    Interface adaptive selon les besoins cognitifs spécifiques
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="w-8 h-8 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Contrôles avancés</h3>
                  <p className="text-sm text-muted-foreground">
                    Paramètres d'accessibilité plus granulaires et personnalisables
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}