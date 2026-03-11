import { useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { mapCoursesToCardModels, type CourseCardModel } from '../../lib/coursePresentation';
import { Clock, Play, Search, Star, Users } from 'lucide-react';

interface CategoryCoursesViewProps {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeClassName: string;
  icon: React.ReactNode;
  matchesCategory: (course: CourseCardModel) => boolean;
  onNavigate: (path: string) => void;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function CategoryCoursesView({
  title,
  subtitle,
  badgeLabel,
  badgeClassName,
  icon,
  matchesCategory,
  onNavigate,
}: CategoryCoursesViewProps) {
  const { data: courses = [], isLoading } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredCourses = useMemo(() => {
    let list = mapCoursesToCardModels(courses, activeSessions).filter(matchesCategory);

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      list = list.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.instructorName.toLowerCase().includes(query),
      );
    }

    if (levelFilter !== 'all') {
      list = list.filter((course) => course.level === levelFilter);
    }

    if (priceFilter !== 'all') {
      list = list.filter((course) => {
        if (priceFilter === 'under50') return course.price < 50;
        if (priceFilter === 'under100') return course.price < 100;
        if (priceFilter === 'free') return course.price === 0;
        if (priceFilter === 'paid') return course.price > 0;
        return true;
      });
    }

    if (sortBy === 'popularity') list = list.sort((a, b) => b.studentCount - a.studentCount);
    if (sortBy === 'rating') list = list.sort((a, b) => b.price - a.price);
    if (sortBy === 'price-low') list = list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') list = list.sort((a, b) => b.price - a.price);

    return list;
  }, [courses, activeSessions, matchesCategory, searchTerm, levelFilter, priceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className={`border-b bg-gradient-to-br ${badgeClassName}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center">
              <span className="mr-3">{icon}</span>
              <span className="font-medium">{badgeLabel}</span>
            </div>
            <h1 className="text-4xl">{title}</h1>
            <p className="mt-4 text-xl text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularite</SelectItem>
                <SelectItem value="rating">Prix max</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix decroissant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="beginner">Debutant</SelectItem>
                <SelectItem value="intermediate">Intermediaire</SelectItem>
                <SelectItem value="advanced">Avance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="under50">&lt; 50€</SelectItem>
                <SelectItem value="under100">&lt; 100€</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl">{isLoading ? 'Chargement...' : `${filteredCourses.length} cours trouves`}</h2>
          <Badge variant="outline">{badgeLabel}</Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={String(index)} className="h-72 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : filteredCourses.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="cursor-pointer transition-all hover:shadow-lg">
                <div className="relative">
                  <ImageWithFallback
                    src={course.coverImage}
                    alt={course.title}
                    className="h-48 w-full rounded-t-lg object-cover"
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge variant={course.isLive ? 'destructive' : 'secondary'} className="text-xs">
                      {course.isLive ? 'Live' : 'A la demande'}
                    </Badge>
                    <Badge variant="outline" className="bg-background/80 text-xs capitalize">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <div className="text-xl font-bold">{course.price}€</div>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{course.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>

                  <div className="mb-4 flex items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{course.instructorName}</span>
                  </div>

                  <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-500" />
                      <span>4.8</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{course.studentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => onNavigate(`/courses/${course.id}`)}>
                    <Play className="mr-2 h-4 w-4" />
                    Voir le cours
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Aucun cours trouve.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSortBy('popularity');
                setLevelFilter('all');
                setPriceFilter('all');
              }}
            >
              Reinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
