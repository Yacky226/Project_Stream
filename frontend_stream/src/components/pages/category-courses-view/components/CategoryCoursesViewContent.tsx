import { Clock, Play, Search, Star, Users } from 'lucide-react';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import {
  CATEGORY_COURSES_LEVEL_OPTIONS,
  CATEGORY_COURSES_PRICE_OPTIONS,
  CATEGORY_COURSES_SORT_OPTIONS,
} from '../categoryCoursesView.constants';
import type {
  CategoryCoursesViewData,
  CategoryCoursesViewProps,
} from '../categoryCoursesView.types';
import { formatCategoryCourseDuration } from '../categoryCoursesView.utils';

interface CategoryCoursesViewContentProps {
  header: Pick<CategoryCoursesViewProps, 'title' | 'subtitle' | 'badgeLabel' | 'badgeClassName' | 'icon'>;
  data: CategoryCoursesViewData;
  onNavigate: (path: string) => void;
}

export function CategoryCoursesViewContent({
  header,
  data,
  onNavigate,
}: CategoryCoursesViewContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className={`border-b bg-gradient-to-br ${header.badgeClassName}`}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="mb-6 flex items-center">
              <span className="mr-3">{header.icon}</span>
              <span className="font-medium">{header.badgeLabel}</span>
            </div>
            <h1 className="text-4xl">{header.title}</h1>
            <p className="mt-4 text-xl text-muted-foreground">{header.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={data.searchTerm}
              onChange={(event) => data.setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={data.sortBy} onValueChange={data.setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_COURSES_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={data.levelFilter} onValueChange={data.setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_COURSES_LEVEL_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={data.priceFilter} onValueChange={data.setPriceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_COURSES_PRICE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl">
            {data.isLoading ? 'Chargement...' : `${data.filteredCourses.length} cours trouves`}
          </h2>
          <Badge variant="outline">{header.badgeLabel}</Badge>
        </div>

        {data.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={String(index)} className="h-72 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : data.filteredCourses.length ? (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {data.filteredCourses.map((course) => (
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
                    <div className="text-xl font-bold">{course.price} EUR</div>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold">{course.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {course.description}
                  </p>

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
                      <span>{formatCategoryCourseDuration(course.duration)}</span>
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
            <Button variant="outline" onClick={data.resetFilters}>
              Reinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
