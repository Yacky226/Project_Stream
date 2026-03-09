import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTranslation } from '../../lib/i18n';
import { mockCourses, type Course } from '../../lib/auth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Grid3X3, 
  List,
  SlidersHorizontal
} from 'lucide-react';

interface CourseCatalogProps {
  onNavigate: (path: string) => void;
}

export function CourseCatalog({ onNavigate }: CourseCatalogProps) {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load courses with additional mock data
    const expandedCourses = [
      ...mockCourses,
      {
        id: '4',
        title: 'Python pour les Débutants',
        description: 'Apprenez Python depuis les bases jusqu\'aux concepts avancés avec des projets pratiques.',
        instructorId: '4',
        instructorName: 'Thomas Dubois',
        coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600',
        duration: 200,
        studentCount: 3200,
        category: 'Programming',
        isLive: false,
        price: 89,
        level: 'beginner' as const
      },
      {
        id: '5',
        title: 'Marketing Digital Avancé',
        description: 'Maîtrisez les stratégies de marketing digital modernes et les outils d\'analyse.',
        instructorId: '5',
        instructorName: 'Laura Martinez',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600',
        duration: 150,
        studentCount: 1800,
        category: 'Marketing',
        isLive: true,
        nextSession: {
          id: 'session-3',
          startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000)
        },
        price: 129,
        level: 'advanced' as const
      },
      {
        id: '6',
        title: 'Photographie Créative',
        description: 'Développez votre œil artistique et maîtrisez les techniques photographiques professionnelles.',
        instructorId: '6',
        instructorName: 'Antoine Leroy',
        coverImage: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600',
        duration: 95,
        studentCount: 950,
        category: 'Art',
        isLive: false,
        price: 69,
        level: 'intermediate' as const
      }
    ];
    
    setCourses(expandedCourses);
    setFilteredCourses(expandedCourses);
  }, []);

  useEffect(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Price filter
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'free':
          filtered = filtered.filter(course => course.price === 0);
          break;
        case 'under50':
          filtered = filtered.filter(course => course.price > 0 && course.price < 50);
          break;
        case '50to100':
          filtered = filtered.filter(course => course.price >= 50 && course.price <= 100);
          break;
        case 'over100':
          filtered = filtered.filter(course => course.price > 100);
          break;
      }
    }

    // Sort
    switch (selectedSort) {
      case 'popular':
        filtered.sort((a, b) => b.studentCount - a.studentCount);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedSort, priceRange]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const categories = Array.from(new Set(courses.map(c => c.category)));

  const CourseCard = ({ course, isListView = false }: { course: Course, isListView?: boolean }) => (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${isListView ? 'flex' : ''}`} 
          onClick={() => onNavigate(`/courses/${course.id}`)}>
      <div className={`relative ${isListView ? 'w-64 flex-shrink-0' : ''}`}>
        <ImageWithFallback 
          src={course.coverImage}
          alt={course.title}
          className={`w-full object-cover ${isListView ? 'h-full' : 'h-48'}`}
        />
        {course.isLive && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            {t('course.live')}
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Play className="w-4 h-4 mr-1" />
            {course.isLive ? t('course.joinLive') : t('course.watch')}
          </Button>
        </div>
      </div>
      
      <div className="flex-1">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className={`line-clamp-2 ${isListView ? 'text-lg' : ''}`}>
              {course.title}
            </CardTitle>
            <Badge variant="secondary">${course.price}</Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {course.studentCount.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              4.8
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Par {course.instructorName}
            </p>
            <Badge variant="outline" className="text-xs capitalize">
              {course.level}
            </Badge>
          </div>
          
          {course.nextSession && (
            <div className="mt-2 text-sm text-primary">
              Session live dans {Math.ceil((course.nextSession.startTime.getTime() - Date.now()) / (1000 * 60 * 60))}h
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-4">Catalogue de Cours</h1>
        <p className="text-muted-foreground">
          Découvrez nos {courses.length} cours dispensés par des experts
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher des cours..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
          </Button>

          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Les plus populaires</SelectItem>
              <SelectItem value="newest">Les plus récents</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix décroissant</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2 ml-auto">
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
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Niveau</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Prix</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les prix</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="under50">Moins de 50€</SelectItem>
                    <SelectItem value="50to100">50€ - 100€</SelectItem>
                    <SelectItem value="over100">Plus de 100€</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setPriceRange('all');
                    setSelectedSort('popular');
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredCourses.length} cours trouvé{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Course Grid/List */}
      {filteredCourses.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
        }>
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              isListView={viewMode === 'list'} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun cours trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setPriceRange('all');
            }}
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}