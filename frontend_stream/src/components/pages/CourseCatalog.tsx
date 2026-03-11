import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { mapCoursesToCardModels, type CourseCardModel } from '../../lib/coursePresentation';
import {
  Grid3X3,
  List,
  Play,
  Search,
  SlidersHorizontal,
  Clock,
  Users,
  Star,
} from 'lucide-react';

interface CourseCatalogProps {
  onNavigate: (path: string) => void;
}

type ViewMode = 'grid' | 'list';

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function filterAndSortCourses(
  courses: CourseCardModel[],
  searchQuery: string,
  selectedCategory: string,
  selectedLevel: string,
  selectedSort: string,
  priceRange: string,
): CourseCardModel[] {
  let filtered = [...courses];

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructorName.toLowerCase().includes(query),
    );
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((course) => course.category === selectedCategory);
  }

  if (selectedLevel !== 'all') {
    filtered = filtered.filter((course) => course.level === selectedLevel);
  }

  if (priceRange !== 'all') {
    filtered = filtered.filter((course) => {
      if (priceRange === 'free') return course.price === 0;
      if (priceRange === 'under50') return course.price > 0 && course.price < 50;
      if (priceRange === '50to100') return course.price >= 50 && course.price <= 100;
      if (priceRange === 'over100') return course.price > 100;
      return true;
    });
  }

  filtered.sort((a, b) => {
    if (selectedSort === 'popular') return b.studentCount - a.studentCount;
    if (selectedSort === 'newest') return Number(b.id) - Number(a.id);
    if (selectedSort === 'price-low') return a.price - b.price;
    if (selectedSort === 'price-high') return b.price - a.price;
    if (selectedSort === 'duration') return a.duration - b.duration;
    return 0;
  });

  return filtered;
}

function CourseCard({
  course,
  viewMode,
  onNavigate,
}: {
  course: CourseCardModel;
  viewMode: ViewMode;
  onNavigate: (path: string) => void;
}) {
  const isListView = viewMode === 'list';
  const liveHours =
    course.nextSession && course.nextSession.startTime.getTime() > Date.now()
      ? Math.ceil((course.nextSession.startTime.getTime() - Date.now()) / (1000 * 60 * 60))
      : null;

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-shadow hover:shadow-lg ${isListView ? 'flex' : ''}`}
      onClick={() => onNavigate(`/courses/${course.id}`)}
    >
      <div className={`relative ${isListView ? 'w-64 shrink-0' : ''}`}>
        <ImageWithFallback
          src={course.coverImage}
          alt={course.title}
          className={`w-full object-cover ${isListView ? 'h-full' : 'h-48'}`}
        />
        {course.isLive ? (
          <Badge className="absolute right-2 top-2 bg-red-500 text-white">
            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            Live
          </Badge>
        ) : null}
      </div>

      <div className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
            <Badge variant="secondary">{course.price}€</Badge>
          </div>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {course.studentCount.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
              4.8
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{course.instructorName}</p>
            <Badge variant="outline" className="capitalize">
              {course.level}
            </Badge>
          </div>

          {liveHours ? (
            <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/5 px-2 py-1 text-xs text-red-600">
              Session live dans {liveHours}h
            </div>
          ) : null}

          <Button className="mt-3 w-full" variant={course.isLive ? 'default' : 'outline'}>
            <Play className="mr-2 h-4 w-4" />
            {course.isLive ? 'Rejoindre live' : 'Voir le cours'}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}

export function CourseCatalog({ onNavigate }: CourseCatalogProps) {
  const { data: courses = [], isLoading } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const normalizedCourses = useMemo(
    () => mapCoursesToCardModels(courses, activeSessions),
    [courses, activeSessions],
  );

  const filteredCourses = useMemo(
    () =>
      filterAndSortCourses(
        normalizedCourses,
        searchQuery,
        selectedCategory,
        selectedLevel,
        selectedSort,
        priceRange,
      ),
    [normalizedCourses, searchQuery, selectedCategory, selectedLevel, selectedSort, priceRange],
  );

  const categories = useMemo(
    () => Array.from(new Set(normalizedCourses.map((course) => course.category))).sort(),
    [normalizedCourses],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl">Catalogue de Cours</h1>
        <p className="text-muted-foreground">
          Donnees reelles depuis la plateforme: {normalizedCourses.length} cours.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des cours..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtres
          </Button>

          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popularite</SelectItem>
              <SelectItem value="newest">Plus recents</SelectItem>
              <SelectItem value="price-low">Prix croissant</SelectItem>
              <SelectItem value="price-high">Prix decroissant</SelectItem>
              <SelectItem value="duration">Duree</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center space-x-2">
            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters ? (
          <Card className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Categorie</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Niveau</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="beginner">Debutant</SelectItem>
                    <SelectItem value="intermediate">Intermediaire</SelectItem>
                    <SelectItem value="advanced">Avance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Prix</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="under50">Moins de 50€</SelectItem>
                    <SelectItem value="50to100">50€ a 100€</SelectItem>
                    <SelectItem value="over100">Plus de 100€</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setPriceRange('all');
                    setSelectedSort('popular');
                  }}
                >
                  Reinitialiser
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {isLoading ? 'Chargement...' : `${filteredCourses.length} cours trouves`}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={String(index)} className="h-72 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : filteredCourses.length ? (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} viewMode={viewMode} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">Aucun cours trouve pour ces filtres.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLevel('all');
              setPriceRange('all');
            }}
          >
            Reinitialiser
          </Button>
        </div>
      )}
    </div>
  );
}
