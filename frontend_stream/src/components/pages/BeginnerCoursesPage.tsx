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
  GraduationCap,
  BookOpen,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Award,
  TrendingUp
} from 'lucide-react';

interface BeginnerCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function BeginnerCoursesPage({ onNavigate }: BeginnerCoursesPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  // Mock beginner-specific courses
  const beginnerCourses = [
    {
      id: 'beginner-1',
      title: 'Introduction �� la Programmation',
      description: 'Apprenez les bases de la programmation avec des concepts simples et des projets pratiques.',
      instructorId: '1',
      instructorName: 'Pierre Martin',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600',
      duration: 120,
      studentsCount: 8420,
      category: 'Programming',
      isLive: true,
      price: 49,
      level: 'beginner',
      rating: 4.9,
      difficulty: 'Très facile',
      prerequisites: 'Aucun',
      completionTime: '2-3 semaines',
      skills: ['Variables', 'Boucles', 'Fonctions', 'Logique de base']
    },
    {
      id: 'beginner-2',
      title: 'Design Graphique pour Débutants',
      description: 'Découvrez les principes fondamentaux du design graphique et créez vos premiers visuels.',
      instructorId: '2',
      instructorName: 'Sophie Dubois',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600',
      duration: 100,
      studentsCount: 6750,
      category: 'Design',
      isLive: false,
      price: 39,
      level: 'beginner',
      rating: 4.8,
      difficulty: 'Facile',
      prerequisites: 'Aucun',
      completionTime: '1-2 semaines',
      skills: ['Théorie des couleurs', 'Typographie', 'Composition', 'Canva']
    },
    {
      id: 'beginner-3',
      title: 'Marketing Digital : Les Bases',
      description: 'Comprenez le marketing digital et lancez vos premières campagnes avec succès.',
      instructorId: '3',
      instructorName: 'Thomas Chen',
      coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
      duration: 140,
      studentsCount: 5940,
      category: 'Marketing',
      isLive: true,
      price: 59,
      level: 'beginner',
      rating: 4.7,
      difficulty: 'Facile',
      prerequisites: 'Notions de base en informatique',
      completionTime: '2-3 semaines',
      skills: ['SEO', 'Réseaux sociaux', 'Email marketing', 'Analytics']
    },
    {
      id: 'beginner-4',
      title: 'Création de Site Web avec WordPress',
      description: 'Créez votre premier site web professionnel sans connaissances techniques.',
      instructorId: '4',
      instructorName: 'Marie Rodriguez',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600',
      duration: 90,
      studentsCount: 4280,
      category: 'Web Development',
      isLive: false,
      price: 69,
      level: 'beginner',
      rating: 4.6,
      difficulty: 'Facile',
      prerequisites: 'Navigation internet',
      completionTime: '1-2 semaines',
      skills: ['WordPress', 'Thèmes', 'Plugins', 'Hébergement']
    },
    {
      id: 'beginner-5',
      title: 'Photographie pour Débutants',
      description: 'Maîtrisez votre appareil photo et apprenez les techniques de base de la photographie.',
      instructorId: '5',
      instructorName: 'Lucas Wilson',
      coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600',
      duration: 110,
      studentsCount: 3650,
      category: 'Photography',
      isLive: true,
      price: 79,
      level: 'beginner',
      rating: 4.8,
      difficulty: 'Facile',
      prerequisites: 'Appareil photo (smartphone ou reflex)',
      completionTime: '2-3 semaines',
      skills: ['Composition', 'Exposition', 'Éclairage', 'Retouche de base']
    },
    {
      id: 'beginner-6',
      title: 'Excel : Maîtrisez les Fondamentaux',
      description: 'Apprenez Excel de zéro et devenez efficace dans vos tâches quotidiennes.',
      instructorId: '6',
      instructorName: 'Julie Thompson',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600',
      duration: 80,
      studentsCount: 7890,
      category: 'Business',
      isLive: false,
      price: 29,
      level: 'beginner',
      rating: 4.9,
      difficulty: 'Très facile',
      prerequisites: 'Ordinateur avec Excel',
      completionTime: '1 semaine',
      skills: ['Formules', 'Graphiques', 'Tableaux croisés', 'Mise en forme']
    }
  ];

  const allCourses = [...mockCourses.filter(c => c.level === 'beginner'), ...beginnerCourses];

  useEffect(() => {
    let filtered = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && course.price === 0) ||
                          (priceFilter === 'paid' && course.price > 0) ||
                          (priceFilter === 'under50' && course.price < 50) ||
                          (priceFilter === 'under100' && course.price < 100);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort courses
    if (sortBy === 'popularity') {
      filtered.sort((a, b) => b.studentsCount - a.studentsCount);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'duration') {
      filtered.sort((a, b) => a.duration - b.duration);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, sortBy, categoryFilter, priceFilter]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'très facile': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'facile': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'Programming', label: 'Programmation' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Web Development', label: 'Développement Web' },
    { value: 'Photography', label: 'Photographie' },
    { value: 'Business', label: 'Business' }
  ];

  const learningPaths = [
    {
      title: 'Développeur Web',
      courses: 4,
      duration: '3-4 mois',
      description: 'Apprenez HTML, CSS, JavaScript et créez vos premiers sites web.',
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      title: 'Designer Digital',
      courses: 3,
      duration: '2-3 mois', 
      description: 'Maîtrisez les outils de design et les principes visuels.',
      icon: <Target className="w-5 h-5" />
    },
    {
      title: 'Marketeur Digital',
      courses: 5,
      duration: '2-3 mois',
      description: 'Développez vos compétences en marketing digital et réseaux sociaux.',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-950/20 dark:to-yellow-950/20 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <GraduationCap className="w-8 h-8 text-orange-600 mr-3" />
              <span className="text-orange-600 font-medium">Débutant</span>
            </div>
            <h1 className="text-4xl mb-6">
              Commencez Votre Apprentissage
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Découvrez nos cours spécialement conçus pour les débutants. 
              Aucune expérience préalable requise, apprenez à votre rythme avec nos experts.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">60+</div>
                <div className="text-sm text-muted-foreground">Cours débutants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">25K+</div>
                <div className="text-sm text-muted-foreground">Étudiants formés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">0</div>
                <div className="text-sm text-muted-foreground">Prérequis nécessaire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">92%</div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Aucune expérience requise
              </div>
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Support personnalisé
              </div>
              <div className="flex items-center bg-white/50 dark:bg-black/20 rounded-full px-4 py-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Projets pratiques
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Learning Paths */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl mb-4">Parcours d'Apprentissage Recommandés</h2>
            <p className="text-muted-foreground">Suivez un parcours structuré pour atteindre vos objectifs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (path.title.includes('Développeur')) {
                    setCategoryFilter('Programming');
                  } else if (path.title.includes('Designer')) {
                    setCategoryFilter('Design');
                  } else if (path.title.includes('Marketeur')) {
                    setCategoryFilter('Marketing');
                  }
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-orange-600 mr-3">
                      {path.icon}
                    </div>
                    <h3 className="font-semibold">{path.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{path.description}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                    <span>{path.courses} cours</span>
                    <span>{path.duration}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Commencer le parcours
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher parmi les cours débutants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularité</SelectItem>
                  <SelectItem value="rating">Note</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="duration">Durée courte</SelectItem>
                </SelectContent>
              </Select>

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

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous prix</SelectItem>
                  <SelectItem value="free">Gratuit</SelectItem>
                  <SelectItem value="under50">Moins de 50€</SelectItem>
                  <SelectItem value="under100">Moins de 100€</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">
              {filteredCourses.length} cours débutants trouvés
            </h2>
            <Badge variant="outline" className="text-sm bg-orange-50 text-orange-600 border-orange-200">
              <GraduationCap className="w-3 h-3 mr-1" />
              Niveau Débutant
            </Badge>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-all cursor-pointer group">
              <div className="relative">
                <ImageWithFallback
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={course.isLive ? "destructive" : "secondary"} className="text-xs">
                    {course.isLive ? 'Live' : 'À la demande'}
                  </Badge>
                  {course.difficulty && (
                    <Badge className={`text-xs ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </Badge>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" className="pointer-events-none">
                    <Play className="w-4 h-4 mr-2" />
                    Commencer
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xl font-bold">{course.price === 0 ? 'Gratuit' : `${course.price}€`}</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                {course.completionTime && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-orange-700 dark:text-orange-300">Durée estimée:</span>
                      <span className="font-medium">{course.completionTime}</span>
                    </div>
                    {course.prerequisites && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-orange-700 dark:text-orange-300">Prérequis:</span>
                        <span className="font-medium">{course.prerequisites}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">{course.instructorName}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span>{course.rating || 4.5}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.studentsCount?.toLocaleString() || course.studentCount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                  </div>
                </div>

                {course.skills && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.skills.slice(0, 3).map((skill: string) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {course.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => onNavigate(`/courses/${course.id}`)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Commencer ce cours
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              Aucun cours trouvé pour ces critères
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setPriceFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-xl p-8">
          <GraduationCap className="w-12 h-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl mb-4">Prêt à transmettre vos connaissances ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Aidez les débutants à faire leurs premiers pas en partageant votre expertise et vos conseils pratiques.
          </p>
          <Button size="lg" onClick={() => onNavigate('/teacher/signup')}>
            <Award className="w-5 h-5 mr-2" />
            Enseigner aux débutants
          </Button>
        </div>
      </div>
    </div>
  );
}