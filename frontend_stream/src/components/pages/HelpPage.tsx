import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../lib/i18n';
import { 
  Search, 
  Book, 
  Video, 
  MessageSquare, 
  Phone, 
  Mail,
  FileText,
  Users,
  Zap,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Download,
  ExternalLink,
  Clock,
  ThumbsUp,
  Star,
  CheckCircle,
  Lightbulb,
  Shield,
  Headphones,
  Globe,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

interface HelpPageProps {
  onNavigate: (path: string) => void;
}

export function HelpPage({ onNavigate }: HelpPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showArticleModal, setShowArticleModal] = useState(false);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Premiers pas',
      description: 'Guides pour commencer sur Stream Éducatif',
      icon: Zap,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      articles: 12,
      popular: true
    },
    {
      id: 'courses',
      title: 'Cours et apprentissage',
      description: 'Tout sur les cours, sessions live et certifications',
      icon: Book,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      articles: 18,
      popular: true
    },
    {
      id: 'technical',
      title: 'Support technique',
      description: 'Résolution des problèmes techniques',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      articles: 8,
      popular: false
    },
    {
      id: 'account',
      title: 'Compte et paiements',
      description: 'Gestion du compte, facturation et remboursements',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      articles: 10,
      popular: false
    },
    {
      id: 'mobile',
      title: 'Application mobile',
      description: 'Utilisation de l\'app iOS et Android',
      icon: Globe,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
      articles: 6,
      popular: false
    },
    {
      id: 'accessibility',
      title: 'Accessibilité',
      description: 'Fonctionnalités d\'accessibilité et support',
      icon: Lightbulb,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      articles: 4,
      popular: false
    }
  ];

  const popularArticles = [
    {
      id: '1',
      title: 'Comment créer mon premier compte ?',
      description: 'Guide complet pour s\'inscrire et configurer votre profil',
      readTime: '3 min',
      views: 1250,
      rating: 4.9,
      category: 'getting-started',
      lastUpdated: '2024-01-15',
      content: `
        **Créer votre compte Stream Éducatif :**
        
        1. **Inscription**
           - Rendez-vous sur notre page d'accueil
           - Cliquez sur "S'inscrire" en haut à droite
           - Choisissez votre type de compte (Étudiant/Enseignant)
        
        2. **Informations requises**
           - Adresse email valide
           - Mot de passe sécurisé (8+ caractères)
           - Nom et prénom
           - Pays de résidence
        
        3. **Vérification email**
           - Consultez votre boîte mail
           - Cliquez sur le lien de confirmation
           - Votre compte est activé !
        
        4. **Configuration du profil**
           - Ajoutez une photo de profil
           - Renseignez vos centres d'intérêt
           - Définissez vos objectifs d'apprentissage
        
        **Note :** L'inscription est gratuite et prend moins de 5 minutes !
      `
    },
    {
      id: '2',
      title: 'Participer à une session live',
      description: 'Tout ce que vous devez savoir sur les cours en direct',
      readTime: '5 min',
      views: 980,
      rating: 4.8,
      category: 'courses',
      lastUpdated: '2024-01-12',
      content: `
        **Rejoindre une session live :**
        
        1. **Avant la session**
           - Vérifiez votre connexion internet
           - Testez votre micro et caméra
           - Préparez vos questions
        
        2. **Accès à la session**
           - Connectez-vous 10 minutes avant
           - Utilisez le lien dans "Mes Cours"
           - Autorisez l'accès micro/caméra si demandé
        
        3. **Pendant la session**
           - Utilisez le chat pour poser des questions
           - Levez la main virtuellement
           - Participez aux sondages en temps réel
        
        4. **Outils disponibles**
           - Chat en direct
           - Partage d'écran
           - Tableau blanc collaboratif
           - Sondages interactifs
        
        **Conseil :** Arrivez en avance pour éviter les problèmes techniques !
      `
    },
    {
      id: '3',
      title: 'Télécharger mes certificats',
      description: 'Comment obtenir et télécharger vos certificats de completion',
      readTime: '2 min',
      views: 756,
      rating: 4.7,
      category: 'courses',
      lastUpdated: '2024-01-10',
      content: `
        **Obtenir vos certificats :**
        
        1. **Conditions d'obtention**
           - Compléter 100% du cours
           - Réussir tous les quiz avec 80% minimum
           - Valider le projet final si applicable
        
        2. **Téléchargement**
           - Accédez à "Mes Cours" dans votre profil
           - Cliquez sur le cours terminé
           - Bouton "Télécharger le certificat"
        
        3. **Formats disponibles**
           - PDF haute qualité
           - PNG pour les réseaux sociaux
           - Lien vérifiable en ligne
        
        4. **Partage**
           - LinkedIn : ajoutez directement à votre profil
           - Réseaux sociaux : utilisez le format PNG
           - CV : intégrez le PDF
        
        **Note importante :** Les certificats sont générés automatiquement après validation par notre équipe (24-48h).
      `
    },
    {
      id: '4',
      title: 'Problèmes de lecture vidéo',
      description: 'Solutions aux problèmes les plus courants',
      readTime: '4 min',
      views: 642,
      rating: 4.6,
      category: 'technical',
      lastUpdated: '2024-01-08',
      content: `
        **Résoudre les problèmes de lecture :**
        
        1. **Vérifications de base**
           - Connexion internet stable (5 Mbps minimum)
           - Navigateur à jour (Chrome, Firefox, Safari)
           - Désactiver les bloqueurs de publicité
        
        2. **Problèmes courants**
           - Vidéo qui ne démarre pas : actualiser la page
           - Audio désynchronisé : changer la qualité vidéo
           - Buffering constant : réduire la qualité
        
        3. **Optimisation**
           - Fermer les autres onglets
           - Utiliser une connexion filaire si possible
           - Vider le cache du navigateur
        
        4. **Contact support**
           Si le problème persiste :
           - Décrivez précisément le problème
           - Indiquez votre navigateur et OS
           - Joignez une capture d'écran
        
        **Astuce :** La qualité auto s'adapte à votre connexion !
      `
    },
    {
      id: '5',
      title: 'Utiliser l\'application mobile',
      description: 'Guide d\'utilisation de nos apps iOS et Android',
      readTime: '3 min',
      views: 523,
      rating: 4.5,
      category: 'mobile',
      lastUpdated: '2024-01-05',
      content: `
        **Application mobile Stream Éducatif :**
        
        1. **Installation**
           - iOS : App Store
           - Android : Google Play Store
           - Recherchez "Stream Éducatif"
        
        2. **Fonctionnalités**
           - Tous vos cours en déplacement
           - Téléchargement hors ligne
           - Notifications push
           - Synchronisation avec le web
        
        3. **Navigation**
           - Onglet Accueil : cours recommandés
           - Mes Cours : progression et favoris
           - Live : sessions en direct
           - Profil : paramètres et certificats
        
        4. **Mode hors ligne**
           - Téléchargez vos cours favoris
           - Regardez sans connexion
           - Synchronisation auto au retour
        
        **Bonus :** L'app mobile consomme 50% moins de données !
      `
    }
  ];

  const contactOptions = [
    {
      title: 'Chat en direct',
      description: 'Assistance instantanée avec notre équipe',
      availability: 'Lun-Ven 9h-18h CET',
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      response: 'Réponse immédiate',
      action: () => alert('Chat en direct (à implémenter)')
    },
    {
      title: 'Support par email',
      description: 'support@stream-educatif.fr',
      availability: 'Réponse sous 24h',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      response: 'Réponse sous 24h',
      action: () => onNavigate('/contact')
    },
    {
      title: 'Assistance téléphonique',
      description: '+33 1 23 45 67 89',
      availability: 'Lun-Ven 9h-17h CET',
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      response: 'Support immédiat',
      action: () => alert('Appel en cours...')
    }
  ];

  const quickActions = [
    {
      title: 'Démarrage rapide',
      description: 'Guide de 5 minutes pour bien commencer',
      icon: Zap,
      duration: '5 min',
      action: () => setExpandedArticle('1')
    },
    {
      title: 'Tutoriels vidéo',
      description: 'Guides visuels étape par étape',
      icon: PlayCircle,
      duration: '15 vidéos',
      action: () => alert('Tutoriels vidéo (à implémenter)')
    },
    {
      title: 'FAQ populaires',
      description: 'Réponses aux questions fréquentes',
      icon: HelpCircle,
      duration: '20+ FAQ',
      action: () => onNavigate('/faq')
    },
    {
      title: 'Statut du service',
      description: 'Vérifier l\'état de nos services',
      icon: CheckCircle,
      duration: 'Temps réel',
      action: () => alert('Statut du service (à implémenter)')
    }
  ];

  // Search functionality
  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = popularArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleArticleClick = (article: any) => {
    setExpandedArticle(article.id);
    setShowArticleModal(true);
  };

  const filteredArticles = selectedCategory 
    ? popularArticles.filter(article => article.category === selectedCategory)
    : popularArticles;

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-6 h-6 bg-white/15 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Centre d'aide Stream Éducatif</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Comment pouvons-nous
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                vous aider ?
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Trouvez rapidement des réponses, résolvez vos problèmes et découvrez toutes les fonctionnalités de notre plateforme d'apprentissage.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans l'aide... (ex: comment créer un compte, problème vidéo)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white/90 backdrop-blur-sm border-white/20 text-gray-800 placeholder:text-gray-500 rounded-xl shadow-lg focus:ring-2 focus:ring-white/50"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Search Suggestions */}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleArticleClick(result)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-gray-800 text-sm">{result.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{result.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">500+</div>
                <div className="text-sm text-blue-200">Articles d'aide</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">Support disponible</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">98%</div>
                <div className="text-sm text-blue-200">Satisfaction client</div>
              </div>
              <div className="text-center hidden md:block">
                <div className="text-2xl font-bold mb-1">&lt; 2h</div>
                <div className="text-sm text-blue-200">Temps de réponse</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 -mt-8 relative z-10">
        <div className="container mx-auto px-4">
          {/* Quick Actions */}
          <div className="mb-16">
            <div className="bg-white dark:bg-card rounded-2xl shadow-xl p-8 border border-border">
              <h2 className="text-2xl font-semibold text-center mb-8">Actions rapides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={action.action}
                    className="h-auto p-4 flex flex-col items-center space-y-3 hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <action.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.description}</div>
                      <Badge variant="secondary" className="mt-2 text-xs">{action.duration}</Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Parcourir par catégorie</h2>
              <p className="text-muted-foreground">Trouvez rapidement l'aide dont vous avez besoin</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 ${category.borderColor} ${category.bgColor}`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 ${category.bgColor} border ${category.borderColor}`}>
                        <category.icon className={`w-8 h-8 ${category.color}`} />
                      </div>
                      {category.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                          Populaire
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {category.articles} articles
                      </Badge>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1 ${selectedCategory === category.id ? 'rotate-90' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Articles */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {selectedCategory ? `Articles - ${helpCategories.find(c => c.id === selectedCategory)?.title}` : 'Articles populaires'}
              </h2>
              {selectedCategory && (
                <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                  Voir tous les articles
                </Button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleArticleClick(article)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {helpCategories.find(c => c.id === article.category)?.title}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{article.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {article.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {article.readTime}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {article.views} vues
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Options */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Besoin d'aide personnalisée ?</h2>
              <p className="text-muted-foreground">Notre équipe est là pour vous accompagner</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 ${option.bgColor}`}>
                      <option.icon className={`w-8 h-8 ${option.color}`} />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                    <p className="text-muted-foreground mb-2">{option.description}</p>
                    <p className="text-sm text-muted-foreground mb-4">{option.availability}</p>
                    
                    <div className="flex items-center justify-center mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {option.response}
                      </Badge>
                    </div>
                    
                    <Button onClick={option.action} className="w-full group-hover:shadow-md transition-shadow">
                      Contacter
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlayCircle className="w-5 h-5 mr-2 text-red-600" />
                  Tutoriels vidéo
                </CardTitle>
                <CardDescription>
                  Apprenez avec nos guides vidéo étape par étape
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Créer votre premier cours', duration: '3:45' },
                    { title: 'Rejoindre une session live', duration: '5:12' },
                    { title: 'Télécharger vos certificats', duration: '2:30' },
                    { title: 'Utiliser l\'application mobile', duration: '4:15' }
                  ].map((video, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-950/20 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{video.title}</p>
                        <p className="text-xs text-muted-foreground">{video.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Voir tous les tutoriels
                </Button>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Ressources à télécharger
                </CardTitle>
                <CardDescription>
                  Guides et documents utiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Guide de démarrage rapide (PDF)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    FAQ complète (PDF)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Guide technique streaming
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Application mobile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Communauté
                </CardTitle>
                <CardDescription>
                  Échangez avec d'autres utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Rejoignez notre communauté active de plus de 50 000 apprenants et enseignants.
                </p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Forum communautaire
                    <Badge variant="secondary" className="ml-auto">2.3k posts</Badge>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Discord
                    <Badge variant="secondary" className="ml-auto">En ligne</Badge>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="w-4 h-4 mr-2" />
                    Blog & actualités
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Article Modal */}
      {showArticleModal && expandedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const article = popularArticles.find(a => a.id === expandedArticle);
              if (!article) return null;
              
              return (
                <>
                  <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowArticleModal(false)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        Retour
                      </Button>
                      <Badge variant="outline">
                        {helpCategories.find(c => c.id === article.category)?.title}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowArticleModal(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {article.views} vues
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                        {article.rating}
                      </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
                    
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="text-lg text-muted-foreground mb-8 leading-relaxed">
                        {article.description}
                      </div>
                      
                      <div className="whitespace-pre-line leading-relaxed">
                        {article.content}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-12 pt-6 border-t">
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Utile
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Commentaire
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Mis à jour le {new Date(article.lastUpdated).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}