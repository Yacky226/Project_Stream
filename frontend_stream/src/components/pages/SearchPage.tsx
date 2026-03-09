import { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  PlayCircle, 
  BookOpen,
  TrendingUp,
  Calendar,
  User,
  X,
  SlidersHorizontal,
  MapPin,
  Award,
  Sparkles,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  Grid3X3,
  List,
  Zap,
  Target,
  Globe
} from 'lucide-react';

interface SearchPageProps {
  onNavigate: (path: string) => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  teacherAvatar: string;
  thumbnail: string;
  category: string;
  level: string;
  duration: string;
  students: number;
  rating: number;
  reviewCount: number;
  price: number;
  isLive: boolean;
  tags: string[];
  lastUpdated: string;
  isFeatured: boolean;
  isBestseller: boolean;
  discountPrice?: number;
}

interface Teacher {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  students: number;
  courses: number;
  bio: string;
  location: string;
  experience: string;
  skills: string[];
  isVerified: boolean;
  responseTime: string;
}

interface SearchFilters {
  category: string;
  level: string;
  duration: string;
  price: number[];
  rating: number;
  language: string;
  features: string[];
}

export function SearchPage({ onNavigate }: SearchPageProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('courses');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    level: 'all',
    duration: 'all',
    price: [0, 200],
    rating: 0,
    language: 'all',
    features: []
  });

  // Mock data enriched
  const courses: Course[] = [
    {
      id: '1',
      title: 'React Hooks Avancés',
      description: 'Maîtrisez les hooks React pour créer des applications performantes et maintenables. Découvrez useEffect, useContext, useReducer et créez vos propres hooks personnalisés.',
      teacher: 'Sarah Martin',
      teacherAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1588912914078-2fe5224fd8b8?w=400&h=250&fit=crop',
      category: 'Frontend',
      level: 'Intermédiaire',
      duration: '2h 30min',
      students: 1256,
      rating: 4.8,
      reviewCount: 142,
      price: 49.99,
      isLive: false,
      tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
      lastUpdated: '2024-01-15',
      isFeatured: true,
      isBestseller: true
    },
    {
      id: '2',
      title: 'TypeScript Masterclass',
      description: 'Développement professionnel avec TypeScript : types avancés, génériques et best practices pour des applications scalables.',
      teacher: 'Pierre Dubois',
      teacherAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
      category: 'Backend',
      level: 'Avancé',
      duration: '3h 15min',
      students: 589,
      rating: 4.9,
      reviewCount: 89,
      price: 69.99,
      isLive: true,
      tags: ['TypeScript', 'JavaScript', 'Types', 'Programming'],
      lastUpdated: '2024-01-18',
      isFeatured: false,
      isBestseller: false,
      discountPrice: 54.99
    },
    {
      id: '3',
      title: 'Vue.js pour Débutants',
      description: 'Introduction complète à Vue.js : composants, directives et écosystème pour créer des interfaces utilisateur modernes.',
      teacher: 'Marie Leroux',
      teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      category: 'Frontend',
      level: 'Débutant',
      duration: '1h 45min',
      students: 2234,
      rating: 4.6,
      reviewCount: 267,
      price: 29.99,
      isLive: false,
      tags: ['Vue.js', 'JavaScript', 'Frontend', 'Components'],
      lastUpdated: '2024-01-10',
      isFeatured: false,
      isBestseller: true
    },
    {
      id: '4',
      title: 'Node.js & Express API',
      description: 'Créez des APIs robustes avec Node.js et Express. MongoDB, authentification JWT et déploiement.',
      teacher: 'Alexandre Moreau',
      teacherAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-f7fe82e49e93?w=400&h=250&fit=crop',
      category: 'Backend',
      level: 'Intermédiaire',
      duration: '4h 20min',
      students: 823,
      rating: 4.7,
      reviewCount: 156,
      price: 59.99,
      isLive: false,
      tags: ['Node.js', 'Express', 'API', 'Backend', 'MongoDB'],
      lastUpdated: '2024-01-12',
      isFeatured: true,
      isBestseller: false
    }
  ];

  const teachers: Teacher[] = [
    {
      id: '1',
      name: 'Sarah Martin',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      specialty: 'Développement Frontend',
      rating: 4.8,
      students: 2245,
      courses: 8,
      bio: 'Développeuse senior avec 8 ans d\'expérience en React et TypeScript. Formatrice passionnée par l\'enseignement des meilleures pratiques.',
      location: 'Paris, France',
      experience: '8+ ans',
      skills: ['React', 'TypeScript', 'Vue.js', 'CSS3', 'JavaScript'],
      isVerified: true,
      responseTime: '2h en moyenne'
    },
    {
      id: '2',
      name: 'Pierre Dubois',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      specialty: 'Architecture Backend',
      rating: 4.9,
      students: 1589,
      courses: 6,
      bio: 'Architecte logiciel spécialisé en Node.js et microservices. Expert en performance et scalabilité.',
      location: 'Lyon, France',
      experience: '10+ ans',
      skills: ['Node.js', 'TypeScript', 'Docker', 'AWS', 'MongoDB'],
      isVerified: true,
      responseTime: '1h en moyenne'
    },
    {
      id: '3',
      name: 'Marie Leroux',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      specialty: 'UX/UI Design & Frontend',
      rating: 4.6,
      students: 3412,
      courses: 12,
      bio: 'Designer UX/UI et développeuse frontend. Spécialiste des interfaces modernes et accessibles.',
      location: 'Marseille, France',
      experience: '6+ ans',
      skills: ['Vue.js', 'Figma', 'CSS3', 'Tailwind', 'Accessibility'],
      isVerified: true,
      responseTime: '3h en moyenne'
    }
  ];

  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [filteredTeachers, setFilteredTeachers] = useState(teachers);

  // Filtrage et recherche
  useEffect(() => {
    let results = courses;

    // Recherche textuelle
    if (searchQuery) {
      results = results.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtres
    if (filters.category !== 'all') {
      results = results.filter(course => course.category === filters.category);
    }

    if (filters.level !== 'all') {
      results = results.filter(course => course.level === filters.level);
    }

    if (filters.rating > 0) {
      results = results.filter(course => course.rating >= filters.rating);
    }

    // Prix
    results = results.filter(course => 
      course.price >= filters.price[0] && course.price <= filters.price[1]
    );

    // Tri
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'students':
        results.sort((a, b) => b.students - a.students);
        break;
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      default:
        // Prioriser les cours featured et bestseller
        results.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return 0;
        });
        break;
    }

    setFilteredCourses(results);
  }, [searchQuery, filters, sortBy]);

  // Filtrage des enseignants
  useEffect(() => {
    let results = teachers;

    if (searchQuery) {
      results = results.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTeachers(results);
  }, [searchQuery]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      level: 'all',
      duration: 'all',
      price: [0, 200],
      rating: 0,
      language: 'all',
      features: []
    });
  };

  const popularSearches = ['React', 'TypeScript', 'Vue.js', 'Node.js', 'Python', 'JavaScript', 'CSS', 'Design'];
  const trendingTopics = ['IA & Machine Learning', 'Blockchain', 'Cybersécurité', 'Cloud AWS', 'DevOps'];
  
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== 0 && (Array.isArray(value) ? value.length > 0 && !(value[0] === 0 && value[1] === 200) : true)
  ).length;

  const CourseCard = ({ course, isGrid }: { course: Course; isGrid: boolean }) => {
    if (isGrid) {
      return (
        <Card 
          className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 shadow-md"
          onClick={() => onNavigate(`/courses/${course.id}`)}
        >
          <div className="relative">
            <div className="aspect-video relative overflow-hidden">
              <ImageWithFallback 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {course.isLive && (
                  <Badge className="bg-red-600 text-white border-0 shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </Badge>
                )}
                {course.isFeatured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Coup de cœur
                  </Badge>
                )}
                {course.isBestseller && (
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Duration */}
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="bg-black/70 text-white border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  {course.duration}
                </Badge>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={course.teacherAvatar} />
                <AvatarFallback>{course.teacher[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{course.teacher}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {course.level}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {course.students.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                  {course.rating}
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {course.category}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {course.discountPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">{course.discountPrice}€</span>
                    <span className="text-sm text-muted-foreground line-through">{course.price}€</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-primary">{course.price}€</span>
                )}
              </div>
              <Button size="sm" className="group-hover:shadow-lg transition-shadow">
                Voir le cours
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    // List view
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onNavigate(`/courses/${course.id}`)}>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-80 aspect-video lg:aspect-auto relative">
            <ImageWithFallback 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.isLive && (
              <Badge className="absolute top-2 left-2 bg-red-600">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                LIVE
              </Badge>
            )}
            {course.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500">
                <Sparkles className="w-3 h-3 mr-1" />
                Coup de cœur
              </Badge>
            )}
          </div>
          <div className="flex-1 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <Badge variant="outline">{course.level}</Badge>
                  {course.isBestseller && (
                    <Badge className="bg-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Bestseller
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={course.teacherAvatar} />
                      <AvatarFallback>{course.teacher[0]}</AvatarFallback>
                    </Avatar>
                    {course.teacher}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students.toLocaleString()} étudiants
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                    <span className="text-muted-foreground ml-1">({course.reviewCount})</span>
                  </div>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {course.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right lg:ml-6 mt-4 lg:mt-0">
                {course.discountPrice ? (
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-primary">{course.discountPrice}€</div>
                    <div className="text-sm text-muted-foreground line-through">{course.price}€</div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold mb-2">{course.price}€</div>
                )}
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`/courses/${course.id}`);
                  }}
                  className="w-full lg:w-auto"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Voir le cours
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const TeacherCard = ({ teacher }: { teacher: Teacher }) => (
    <Card 
      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => onNavigate(`/profile/teacher/${teacher.id}`)}
    >
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src={teacher.avatar} />
            <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          {teacher.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Award className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
              {teacher.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {teacher.location}
            </Badge>
          </div>
          
          <p className="text-primary font-medium mb-1">{teacher.specialty}</p>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{teacher.bio}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{teacher.rating}</div>
              <div className="text-muted-foreground flex items-center justify-center">
                <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                Note
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{teacher.students.toLocaleString()}</div>
              <div className="text-muted-foreground">Étudiants</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{teacher.courses}</div>
              <div className="text-muted-foreground">Cours</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {teacher.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {teacher.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{teacher.skills.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              Répond en {teacher.responseTime}
            </div>
            <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              Voir le profil
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-16 overflow-hidden">
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
              <Search className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Rechercher • Plus de 1000 cours disponibles</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trouvez le cours
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                parfait pour vous
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Découvrez des milliers de cours et connectez-vous avec les meilleurs enseignants pour accélérer votre apprentissage.
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  type="text"
                  placeholder="Rechercher des cours, enseignants ou technologies... (ex: React, Python, Design)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-4 py-6 text-lg bg-white/95 backdrop-blur-sm border-white/20 text-gray-800 placeholder:text-gray-500 rounded-2xl shadow-2xl focus:ring-2 focus:ring-white/50"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">1000+</div>
                <div className="text-sm text-blue-200">Cours disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">150+</div>
                <div className="text-sm text-blue-200">Enseignants experts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">50K+</div>
                <div className="text-sm text-blue-200">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">4.8★</div>
                <div className="text-sm text-blue-200">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 -mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Popular & Trending Searches */}
          {!searchQuery && (
            <div className="mb-8">
              <div className="bg-white dark:bg-card rounded-2xl shadow-xl p-8 border border-border">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h2 className="font-semibold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                      Recherches populaires
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map(term => (
                        <Button
                          key={term}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(term)}
                          className="hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="font-semibold text-lg mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-orange-600" />
                      Tendances du moment
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map(topic => (
                        <Button
                          key={topic}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(topic)}
                          className="hover:bg-orange-600 hover:text-white transition-colors"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {topic}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-12 flex-shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres avancés
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={clearFilters} className="h-12">
                    <X className="w-4 h-4 mr-2" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-full lg:w-80 space-y-6">
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>Filtres de recherche</span>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Catégorie</label>
                      <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
                          <SelectItem value="Frontend">Frontend</SelectItem>
                          <SelectItem value="Backend">Backend</SelectItem>
                          <SelectItem value="Full Stack">Full Stack</SelectItem>
                          <SelectItem value="Mobile">Mobile</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="DevOps">DevOps</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Level Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Niveau</label>
                      <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les niveaux</SelectItem>
                          <SelectItem value="Débutant">Débutant</SelectItem>
                          <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                          <SelectItem value="Avancé">Avancé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Prix : {filters.price[0]}€ - {filters.price[1]}€
                      </label>
                      <Slider
                        value={filters.price}
                        onValueChange={(value) => handleFilterChange('price', value)}
                        max={200}
                        step={5}
                        className="mt-2"
                      />
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Note minimum</label>
                      <div className="space-y-2">
                        {[0, 3, 4, 4.5].map(rating => (
                          <div key={rating} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.rating === rating}
                              onCheckedChange={() => handleFilterChange('rating', rating)}
                            />
                            <div className="flex items-center">
                              {rating === 0 ? (
                                <span className="text-sm">Toutes les notes</span>
                              ) : (
                                <>
                                  <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                                  <span className="text-sm">{rating}+ étoiles</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Fonctionnalités</label>
                      <div className="space-y-2">
                        {['Sous-titres', 'Sessions live', 'Certificat', 'Support Q&A', 'Projets pratiques', 'Téléchargeable'].map(feature => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filters.features.includes(feature)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleFilterChange('features', [...filters.features, feature]);
                                } else {
                                  handleFilterChange('features', filters.features.filter(f => f !== feature));
                                }
                              }}
                            />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Type Tabs */}
              <Tabs value={searchType} onValueChange={setSearchType}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <TabsList className="h-12">
                    <TabsTrigger value="courses" className="px-6 text-base">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Cours ({filteredCourses.length})
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="px-6 text-base">
                      <Users className="w-4 h-4 mr-2" />
                      Enseignants ({filteredTeachers.length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {searchType === 'courses' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid3X3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                          >
                            <List className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Trier par..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="relevance">Pertinence</SelectItem>
                            <SelectItem value="rating">Mieux notés</SelectItem>
                            <SelectItem value="students">Plus populaires</SelectItem>
                            <SelectItem value="newest">Plus récents</SelectItem>
                            <SelectItem value="price_low">Prix croissant</SelectItem>
                            <SelectItem value="price_high">Prix décroissant</SelectItem>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </div>

                {/* Search Results */}
                <TabsContent value="courses" className="space-y-6">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-32 h-32 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-4">Aucun cours trouvé</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Nous n'avons trouvé aucun cours correspondant à vos critères. 
                        Essayez de modifier votre recherche ou vos filtres.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={clearFilters} variant="outline">
                          <X className="w-4 h-4 mr-2" />
                          Effacer les filtres
                        </Button>
                        <Button onClick={() => setSearchQuery('')}>
                          <Search className="w-4 h-4 mr-2" />
                          Nouvelle recherche
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Results Summary */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? 's' : ''}
                          {searchQuery && ` pour "${searchQuery}"`}
                        </p>
                        <Badge variant="secondary">
                          {Math.round(filteredCourses.reduce((acc, course) => acc + course.rating, 0) / filteredCourses.length * 10) / 10}★ moyenne
                        </Badge>
                      </div>

                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                        : "space-y-6"
                      }>
                        {filteredCourses.map(course => (
                          <CourseCard key={course.id} course={course} isGrid={viewMode === 'grid'} />
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="teachers" className="space-y-6">
                  {filteredTeachers.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-32 h-32 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-4">Aucun enseignant trouvé</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Aucun enseignant ne correspond à votre recherche. 
                        Essayez avec des mots-clés différents.
                      </p>
                      <Button onClick={() => setSearchQuery('')}>
                        <Search className="w-4 h-4 mr-2" />
                        Nouvelle recherche
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Results Summary */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {filteredTeachers.length} enseignant{filteredTeachers.length > 1 ? 's' : ''} trouvé{filteredTeachers.length > 1 ? 's' : ''}
                          {searchQuery && ` pour "${searchQuery}"`}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {Math.round(filteredTeachers.reduce((acc, teacher) => acc + teacher.rating, 0) / filteredTeachers.length * 10) / 10}★ moyenne
                          </Badge>
                          <Badge variant="outline">
                            {filteredTeachers.filter(t => t.isVerified).length} vérifiés
                          </Badge>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-6">
                        {filteredTeachers.map(teacher => (
                          <TeacherCard key={teacher.id} teacher={teacher} />
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}