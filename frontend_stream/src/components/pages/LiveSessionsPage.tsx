import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from '../../lib/i18n';
import { mockCourses } from '../../lib/auth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  Play,
  Video,
  Calendar,
  RadioIcon as Radio,
  Zap,
  MessageSquare,
  Eye,
  ChevronRight,
  Bell
} from 'lucide-react';

interface LiveSessionsPageProps {
  onNavigate: (path: string) => void;
}

export function LiveSessionsPage({ onNavigate }: LiveSessionsPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredSessions, setFilteredSessions] = useState<any[]>([]);

  // Mock live sessions data
  const liveSessions = [
    {
      id: 'live-1',
      title: 'Masterclass React Hooks Avancés',
      description: 'Session interactive sur les hooks personnalisés et l\'optimisation des performances.',
      instructorId: '1',
      instructorName: 'Sarah Johnson',
      instructorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=150&h=150',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600',
      category: 'Programming',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 90,
      currentViewers: 247,
      maxViewers: 500,
      isLive: true,
      price: 29,
      level: 'intermediate',
      rating: 4.8,
      hasChat: true,
      hasQA: true,
      hasScreenShare: true,
      topics: ['useEffect', 'useMemo', 'useCallback', 'Custom Hooks']
    },
    {
      id: 'live-2',
      title: 'Design System Workshop',
      description: 'Créez un design system complet avec Figma et apprenez les meilleures pratiques.',
      instructorId: '2',
      instructorName: 'Emma Rodriguez',
      instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150',
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600',
      category: 'Design',
      startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      duration: 120,
      currentViewers: 0,
      maxViewers: 300,
      isLive: false,
      price: 39,
      level: 'advanced',
      rating: 4.9,
      hasChat: true,
      hasQA: true,
      hasScreenShare: true,
      topics: ['Design Tokens', 'Components', 'Documentation', 'Figma']
    },
    {
      id: 'live-3',
      title: 'Growth Hacking Strategies',
      description: 'Techniques avancées pour faire croître votre startup rapidement et efficacement.',
      instructorId: '3',
      instructorName: 'Marcus Chen',
      instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
      category: 'Marketing',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      duration: 75,
      currentViewers: 0,
      maxViewers: 400,
      isLive: false,
      price: 25,
      level: 'intermediate',
      rating: 4.7,
      hasChat: true,
      hasQA: true,
      hasScreenShare: true,
      topics: ['A/B Testing', 'Viral Loops', 'User Acquisition', 'Metrics']
    },
    {
      id: 'live-4',
      title: 'Live Coding: API REST avec Node.js',
      description: 'Construisons ensemble une API REST complète avec authentification et base de données.',
      instructorId: '4',
      instructorName: 'David Park',
      instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150',
      coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600',
      category: 'Programming',
      startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
      duration: 180,
      currentViewers: 0,
      maxViewers: 200,
      isLive: false,
      price: 49,
      level: 'intermediate',
      rating: 4.6,
      hasChat: true,
      hasQA: true,
      hasScreenShare: true,
      topics: ['Express.js', 'JWT', 'MongoDB', 'Middleware']
    },
    {
      id: 'live-5',
      title: 'Photographie Portrait en Direct',
      description: 'Session live de photographie portrait avec modèle, éclairage et post-traitement.',
      instructorId: '5',
      instructorName: 'Sophie Martin',
      instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150',
      coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600',
      category: 'Photography',
      startTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      duration: 60,
      currentViewers: 0,
      maxViewers: 150,
      isLive: false,
      price: 35,
      level: 'beginner',
      rating: 4.8,
      hasChat: true,
      hasQA: true,
      hasScreenShare: false,
      topics: ['Éclairage', 'Composition', 'Direction', 'Lightroom']
    }
  ];

  useEffect(() => {
    let filtered = liveSessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || session.category === categoryFilter;
      
      const now = new Date();
      const sessionTime = new Date(session.startTime);
      const timeDiff = sessionTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);
      
      const matchesTime = timeFilter === 'all' ||
                         (timeFilter === 'live' && session.isLive) ||
                         (timeFilter === 'today' && hoursUntil <= 24 && hoursUntil > 0) ||
                         (timeFilter === 'week' && hoursUntil <= 168 && hoursUntil > 0) ||
                         (timeFilter === 'upcoming' && hoursUntil > 0);

      return matchesSearch && matchesCategory && matchesTime;
    });

    // Sort by time (live first, then upcoming)
    filtered.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    setFilteredSessions(filtered);
  }, [searchTerm, categoryFilter, timeFilter]);

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Dans ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `Dans ${minutes}m`;
    } else {
      return 'Maintenant';
    }
  };

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'Programming', label: 'Programmation' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Photography', label: 'Photographie' },
    { value: 'Business', label: 'Business' }
  ];

  const timeFilters = [
    { value: 'all', label: 'Toutes les sessions' },
    { value: 'live', label: 'En direct maintenant' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'upcoming', label: 'À venir' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/20 dark:to-pink-950/20 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <Radio className="w-8 h-8 text-red-600 mr-3" />
              <span className="text-red-600 font-medium">Sessions Live</span>
            </div>
            <h1 className="text-4xl mb-6">
              Apprenez en Direct avec nos Experts
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Participez à des sessions interactives, posez vos questions en temps réel 
              et apprenez directement auprès de nos instructeurs experts.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">200+</div>
                <div className="text-sm text-muted-foreground">Sessions ce mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">15K+</div>
                <div className="text-sm text-muted-foreground">Participants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction live</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">24/7</div>
                <div className="text-sm text-muted-foreground">Sessions disponibles</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <Video className="w-4 h-4 text-red-500 mr-2" />
                Interaction directe
              </div>
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <MessageSquare className="w-4 h-4 text-red-500 mr-2" />
                Chat en temps réel
              </div>
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <Bell className="w-4 h-4 text-red-500 mr-2" />
                Rappels automatiques
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Live Now Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <h2 className="text-2xl">En Direct Maintenant</h2>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredSessions.filter(s => s.isLive).map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-all cursor-pointer border-red-200 dark:border-red-800">
                <div className="relative">
                  <ImageWithFallback
                    src={session.coverImage}
                    alt={session.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="w-3 h-3 mr-1" />
                      EN DIRECT
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 text-white text-sm">
                    <Eye className="w-3 h-3 inline mr-1" />
                    {session.currentViewers}
                  </div>
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center">
                    <Button size="lg" className="bg-red-600 hover:bg-red-700">
                      <Play className="w-5 h-5 mr-2" />
                      Rejoindre maintenant
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">{session.category}</Badge>
                    <div className="text-xl font-bold text-red-600">{session.price}€</div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {session.description}
                  </p>
                  
                  <div className="flex items-center mb-4">
                    <img 
                      src={session.instructorAvatar} 
                      alt={session.instructorName}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-sm">{session.instructorName}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {session.rating}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {session.topics.slice(0, 3).map((topic: string) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => onNavigate(`/courses/${session.id}/live`)}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Rejoindre la session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredSessions.filter(s => s.isLive).length === 0 && (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune session live en cours actuellement</p>
              <p className="text-sm text-muted-foreground">Consultez les sessions à venir ci-dessous</p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Sessions à Venir</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher parmi les sessions live..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  {timeFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSessions.filter(s => !s.isLive).map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-all cursor-pointer">
              <div className="relative">
                <ImageWithFallback
                  src={session.coverImage}
                  alt={session.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatTimeUntil(session.startTime)}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-black/70 rounded-full px-3 py-1 text-white text-sm">
                  <Users className="w-3 h-3 inline mr-1" />
                  {session.maxViewers} max
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{session.category}</Badge>
                  <div className="text-xl font-bold">{session.price}€</div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {session.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <img 
                    src={session.instructorAvatar} 
                    alt={session.instructorName}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium text-sm">{session.instructorName}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      {session.rating}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{session.duration}min</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{session.startTime.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs">
                  {session.hasChat && (
                    <div className="flex items-center text-green-600">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </div>
                  )}
                  {session.hasQA && (
                    <div className="flex items-center text-blue-600">
                      <ChevronRight className="w-3 h-3 mr-1" />
                      Q&A
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {session.topics.slice(0, 2).map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {session.topics.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{session.topics.length - 2}
                    </Badge>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => onNavigate(`/courses/${session.id}`)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  S'inscrire
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSessions.filter(s => !s.isLive).length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              Aucune session trouvée pour ces critères
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setTimeFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-xl p-8">
          <Video className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl mb-4">Animez vos propres sessions live</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Créez des expériences d'apprentissage interactives et connectez-vous directement avec vos étudiants en temps réel.
          </p>
          <Button size="lg" onClick={() => onNavigate('/teacher/signup')}>
            <Zap className="w-5 h-5 mr-2" />
            Créer ma première session live
          </Button>
        </div>
      </div>
    </div>
  );
}