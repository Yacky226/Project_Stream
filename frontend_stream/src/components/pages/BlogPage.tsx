import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTranslation } from '../../lib/i18n';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  ArrowRight,
  BookOpen,
  TrendingUp,
  MessageSquare,
  Share,
  Heart,
  Eye
} from 'lucide-react';

interface BlogPageProps {
  onNavigate: (path: string) => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const categories = [
    { id: 'all', name: 'Tous les articles', count: 24 },
    { id: 'education', name: 'Éducation', count: 8 },
    { id: 'technology', name: 'Technologie', count: 6 },
    { id: 'career', name: 'Carrière', count: 5 },
    { id: 'tips', name: 'Conseils', count: 5 }
  ];

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'L\'avenir de l\'apprentissage en ligne : Tendances 2024',
      excerpt: 'Découvrez les innovations qui révolutionnent l\'éducation digitale et comment Stream Éducatif s\'adapte à ces changements.',
      content: `
        L'éducation en ligne traverse une période de transformation sans précédent. En 2024, plusieurs tendances majeures redéfinissent la façon dont nous apprenons et enseignons.

        ## L'Intelligence Artificielle au Service de l'Apprentissage

        L'IA personnalise désormais l'expérience d'apprentissage de chaque étudiant. Nos algorithmes analysent le rythme d'apprentissage, les préférences et les difficultés pour adapter automatiquement le contenu.

        ### Fonctionnalités IA de Stream Éducatif :
        - Recommandations de cours personnalisées
        - Assistance pédagogique 24/7
        - Évaluation automatique des progrès
        - Détection précoce des difficultés d'apprentissage

        ## La Réalité Virtuelle et Augmentée

        L'immersion devient un facteur clé d'engagement. Les étudiants peuvent désormais :
        - Visiter des sites historiques en VR
        - Manipuler des molécules en 3D
        - S'entraîner dans des environnements simulés

        ## Micro-learning et Nano-diplômes

        L'apprentissage se fragmente en modules plus courts et plus spécialisés. Cette approche répond aux besoins des professionnels qui souhaitent acquérir des compétences rapidement.

        ## Conclusion

        Ces innovations nous permettent d'offrir une expérience d'apprentissage plus engageante, personnalisée et efficace. L'avenir de l'éducation est déjà là.
      `,
      author: {
        name: 'Sarah Martinez',
        avatar: '👩‍💼',
        role: 'Directrice Pédagogique'
      },
      publishedAt: '2024-01-15',
      readTime: '5 min',
      category: 'education',
      tags: ['Innovation', 'E-learning', 'Futur'],
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=400',
      views: 2340,
      likes: 124,
      comments: 18,
      featured: true
    },
    {
      id: '2',
      title: 'Comment créer un cours en ligne engageant',
      excerpt: 'Les meilleures pratiques pour captiver vos étudiants et maximiser leur apprentissage.',
      content: `
        Créer un cours en ligne qui captive et engage vos étudiants nécessite une approche méthodique et créative. Voici les meilleures pratiques testées par nos experts.

        ## 1. Définir des Objectifs Clairs

        Avant de créer votre contenu, établissez des objectifs d'apprentissage SMART :
        - **Spécifiques** : Que va apprendre l'étudiant exactement ?
        - **Mesurables** : Comment évaluer les progrès ?
        - **Atteignables** : Les objectifs sont-ils réalistes ?
        - **Pertinents** : Répondent-ils aux besoins des apprenants ?
        - **Temporels** : Dans quel délai ?

        ## 2. Structurer Votre Contenu

        ### La règle des 3C :
        - **Captiver** : Commencez par un hook attractif
        - **Convaincre** : Présentez les bénéfices concrets
        - **Convertir** : Incitez à l'action

        ### Organisation modulaire :
        - Modules de 20-30 minutes maximum
        - Quiz entre chaque section
        - Récapitulatifs réguliers
        - Projets pratiques

        ## 3. Varier les Formats

        Mélangez différents types de contenu :
        - Vidéos interactives
        - Présentations animées
        - Études de cas
        - Exercices pratiques
        - Sessions live de Q&A

        ## 4. Encourager l'Interaction

        ### Techniques d'engagement :
        - Questions ouvertes régulières
        - Sondages en temps réel
        - Forums de discussion
        - Travail collaboratif
        - Challenges et gamification

        ## 5. Fournir un Feedback Régulier

        Les étudiants ont besoin de savoir où ils en sont :
        - Corrections détaillées des exercices
        - Commentaires personnalisés
        - Badges de progression
        - Certifications intermédiaires

        ## Conclusion

        Un cours engageant combine contenu de qualité, interaction constante et suivi personnalisé. Nos outils vous accompagnent à chaque étape de cette création.
      `,
      author: {
        name: 'Marc Dubois',
        avatar: '👨‍🏫',
        role: 'Expert Pédagogique'
      },
      publishedAt: '2024-01-12',
      readTime: '8 min',
      category: 'tips',
      tags: ['Pédagogie', 'Engagement', 'Création'],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400',
      views: 1890,
      likes: 89,
      comments: 12,
      featured: false
    },
    {
      id: '3',
      title: 'L\'IA dans l\'éducation : Opportunité ou menace ?',
      excerpt: 'Analyse approfondie de l\'impact de l\'intelligence artificielle sur l\'apprentissage moderne.',
      content: '',
      author: {
        name: 'Dr. Emma Chen',
        avatar: '👩‍🔬',
        role: 'Chercheure en IA'
      },
      publishedAt: '2024-01-10',
      readTime: '12 min',
      category: 'technology',
      tags: ['IA', 'Innovation', 'Analyse'],
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400',
      views: 3120,
      likes: 156,
      comments: 31,
      featured: true
    },
    {
      id: '4',
      title: 'Développer ses compétences numériques en 2024',
      excerpt: 'Guide pratique pour rester compétitif sur le marché du travail numérique.',
      content: '',
      author: {
        name: 'Alex Johnson',
        avatar: '👨‍💻',
        role: 'Consultant Digital'
      },
      publishedAt: '2024-01-08',
      readTime: '6 min',
      category: 'career',
      tags: ['Compétences', 'Digital', 'Carrière'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400',
      views: 1654,
      likes: 73,
      comments: 9,
      featured: false
    },
    {
      id: '5',
      title: 'Success Story : De débutant à expert en 6 mois',
      excerpt: 'L\'histoire inspirante de Julie qui a transformé sa carrière grâce à nos formations.',
      content: '',
      author: {
        name: 'Julie Martin',
        avatar: '👩‍🎓',
        role: 'Ancienne Étudiante'
      },
      publishedAt: '2024-01-05',
      readTime: '4 min',
      category: 'education',
      tags: ['Success Story', 'Motivation', 'Témoignage'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400',
      views: 2890,
      likes: 203,
      comments: 45,
      featured: false
    },
    {
      id: '6',
      title: 'Les soft skills : Clé du succès professionnel',
      excerpt: 'Pourquoi les compétences relationnelles sont devenues indispensables dans le monde du travail.',
      content: '',
      author: {
        name: 'Marie Leroy',
        avatar: '👩‍💼',
        role: 'Coach Professionnel'
      },
      publishedAt: '2024-01-03',
      readTime: '7 min',
      category: 'career',
      tags: ['Soft Skills', 'Carrière', 'Développement'],
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400',
      views: 1423,
      likes: 67,
      comments: 15,
      featured: false
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Stream Éducatif</h1>
            <p className="text-xl text-blue-100 mb-8">
              Découvrez les dernières tendances en éducation, technologie et développement professionnel
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher des articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Catégories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                        <Badge variant="secondary">{category.count}</Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {['IA', 'E-learning', 'Carrière', 'Innovation', 'Pédagogie', 'Digital', 'Soft Skills'].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter</CardTitle>
                  <CardDescription>
                    Recevez nos derniers articles directement dans votre boîte mail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input placeholder="Votre email" type="email" />
                    <Button className="w-full">S'abonner</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Articles */}
            {featuredPosts.length > 0 && selectedCategory === 'all' && !searchTerm && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-orange-500" />
                  Articles à la une
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <Badge>{post.category}</Badge>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.readTime}
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{post.author.avatar}</span>
                            <div className="text-sm">
                              <div className="font-medium">{post.author.name}</div>
                              <div className="text-muted-foreground">{post.author.role}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {post.views}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Articles */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {searchTerm ? `Résultats pour "${searchTerm}"` : 'Tous les articles'}
                  <span className="text-muted-foreground text-lg ml-2">
                    ({filteredPosts.length})
                  </span>
                </h2>
              </div>

              {filteredPosts.length > 0 ? (
                <div className="space-y-8">
                  {(searchTerm || selectedCategory !== 'all' ? filteredPosts : regularPosts).map((post) => (
                    <Card 
                      key={post.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => setSelectedPost(post)}
                    >
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="aspect-video md:aspect-square bg-muted overflow-hidden rounded-l-lg">
                          <img 
                            src={post.image} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <Badge variant="outline">{post.category}</Badge>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {post.readTime}
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl">{post.author.avatar}</span>
                              <div className="text-sm">
                                <div className="font-medium">{post.author.name}</div>
                                <div className="text-muted-foreground">{post.author.role}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {post.views}
                                </div>
                                <div className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {post.likes}
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  {post.comments}
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedPost(post)}
                              >
                                Lire plus
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
                    <p className="text-muted-foreground mb-4">
                      Essayez de modifier vos termes de recherche ou sélectionnez une autre catégorie.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPost(null)}
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                    Retour
                  </Button>
                  <Badge>{selectedPost.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="aspect-video bg-muted overflow-hidden rounded-lg mb-6">
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(selectedPost.publishedAt).toLocaleDateString('fr-FR')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedPost.readTime}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {selectedPost.views} vues
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{selectedPost.title}</h1>
              
              <div className="flex items-center space-x-3 mb-6 p-4 bg-muted/50 rounded-lg">
                <span className="text-2xl">{selectedPost.author.avatar}</span>
                <div>
                  <div className="font-medium">{selectedPost.author.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedPost.author.role}</div>
                </div>
              </div>
              
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="text-lg text-muted-foreground mb-6">
                  {selectedPost.excerpt}
                </div>
                
                <div className="whitespace-pre-line leading-relaxed">
                  {selectedPost.content}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-8">
                {selectedPost.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-2" />
                    {selectedPost.likes}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {selectedPost.comments}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}