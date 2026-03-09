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
  Palette,
  Figma,
  Layers,
  Zap,
  Brush,
  Smartphone,
  Monitor,
  Camera
} from 'lucide-react';

interface DesignCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function DesignCoursesPage({ onNavigate }: DesignCoursesPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  // Mock design-specific courses
  const designCourses = [
    {
      id: 'design-1',
      title: 'UI/UX Design Fundamentals',
      description: 'Master the principles of user interface and user experience design from scratch.',
      instructorId: '1',
      instructorName: 'Emma Rodriguez',
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600',
      duration: 200,
      studentsCount: 4250,
      category: 'Design',
      isLive: true,
      price: 79,
      level: 'beginner',
      rating: 4.9,
      specialty: 'UI/UX',
      tools: ['Figma', 'Sketch', 'Adobe XD'],
      skills: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems']
    },
    {
      id: 'design-2',
      title: 'Advanced Figma for Designers',
      description: 'Master Figma with advanced techniques, plugins, and collaborative workflows.',
      instructorId: '2',
      instructorName: 'Thomas Chen',
      coverImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600',
      duration: 150,
      studentsCount: 3180,
      category: 'Design',
      isLive: false,
      price: 99,
      level: 'intermediate',
      rating: 4.8,
      specialty: 'Tools',
      tools: ['Figma'],
      skills: ['Advanced Figma', 'Components', 'Auto Layout', 'Plugins', 'Collaboration']
    },
    {
      id: 'design-3',
      title: 'Mobile App Design Workshop',
      description: 'Design beautiful and functional mobile applications with modern design principles.',
      instructorId: '3',
      instructorName: 'Lisa Park',
      coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600',
      duration: 180,
      studentsCount: 2890,
      category: 'Design',
      isLive: true,
      price: 129,
      level: 'intermediate',
      rating: 4.7,
      specialty: 'Mobile',
      tools: ['Figma', 'Principle', 'Framer'],
      skills: ['Mobile UI', 'iOS Guidelines', 'Android Material', 'Prototyping']
    },
    {
      id: 'design-4',
      title: 'Brand Identity Design',
      description: 'Create compelling brand identities from concept to final execution.',
      instructorId: '4',
      instructorName: 'Sophie Martin',
      coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600',
      duration: 220,
      studentsCount: 2340,
      category: 'Design',
      isLive: false,
      price: 149,
      level: 'intermediate',
      rating: 4.6,
      specialty: 'Branding',
      tools: ['Illustrator', 'Photoshop', 'InDesign'],
      skills: ['Logo Design', 'Brand Strategy', 'Typography', 'Color Theory']
    },
    {
      id: 'design-5',
      title: 'Web Design with Modern CSS',
      description: 'Design and code beautiful websites using modern CSS techniques and frameworks.',
      instructorId: '5',
      instructorName: 'Alex Thompson',
      coverImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600',
      duration: 160,
      studentsCount: 1980,
      category: 'Design',
      isLive: true,
      price: 89,
      level: 'beginner',
      rating: 4.5,
      specialty: 'Web',
      tools: ['CSS', 'HTML', 'Tailwind'],
      skills: ['Responsive Design', 'CSS Grid', 'Flexbox', 'Animations']
    },
    {
      id: 'design-6',
      title: 'Photography & Visual Storytelling',
      description: 'Master photography fundamentals and create compelling visual narratives.',
      instructorId: '6',
      instructorName: 'Maria Garcia',
      coverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600',
      duration: 190,
      studentsCount: 1650,
      category: 'Design',
      isLive: false,
      price: 119,
      level: 'beginner',
      rating: 4.8,
      specialty: 'Photography',
      tools: ['Lightroom', 'Photoshop', 'Capture One'],
      skills: ['Composition', 'Lighting', 'Post-processing', 'Visual Storytelling']
    }
  ];

  const allCourses = [...mockCourses.filter(c => c.category === 'Design'), ...designCourses];

  useEffect(() => {
    let filtered = allCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && course.price === 0) ||
                          (priceFilter === 'paid' && course.price > 0) ||
                          (priceFilter === 'under50' && course.price < 50) ||
                          (priceFilter === 'under100' && course.price < 100);

      const matchesSpecialty = specialtyFilter === 'all' || 
                              course.specialty?.toLowerCase().includes(specialtyFilter.toLowerCase()) ||
                              course.tools?.some(tool => tool.toLowerCase().includes(specialtyFilter.toLowerCase()));

      return matchesSearch && matchesLevel && matchesPrice && matchesSpecialty;
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
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredCourses(filtered);
  }, [searchTerm, sortBy, levelFilter, priceFilter, specialtyFilter]);

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty?.toLowerCase()) {
      case 'ui/ux': return <Layers className="w-5 h-5 text-purple-500" />;
      case 'tools': return <Figma className="w-5 h-5 text-pink-500" />;
      case 'mobile': return <Smartphone className="w-5 h-5 text-blue-500" />;
      case 'branding': return <Brush className="w-5 h-5 text-green-500" />;
      case 'web': return <Monitor className="w-5 h-5 text-cyan-500" />;
      case 'photography': return <Camera className="w-5 h-5 text-orange-500" />;
      default: return <Palette className="w-5 h-5 text-indigo-500" />;
    }
  };

  const designSpecialties = [
    { name: 'UI/UX Design', icon: <Layers className="w-4 h-4" />, courses: 12 },
    { name: 'Branding', icon: <Brush className="w-4 h-4" />, courses: 8 },
    { name: 'Web Design', icon: <Monitor className="w-4 h-4" />, courses: 10 },
    { name: 'Mobile Design', icon: <Smartphone className="w-4 h-4" />, courses: 6 },
    { name: 'Photography', icon: <Camera className="w-4 h-4" />, courses: 5 },
    { name: 'Design Tools', icon: <Figma className="w-4 h-4" />, courses: 9 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <Palette className="w-8 h-8 text-purple-600 mr-3" />
              <span className="text-purple-600 font-medium">Design</span>
            </div>
            <h1 className="text-4xl mb-6">
              Libérez Votre Créativité
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Apprenez le design visuel, l'UX/UI, et maîtrisez les outils créatifs avec nos experts. 
              De l'idée à la réalisation, développez votre vision artistique.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">35+</div>
                <div className="text-sm text-muted-foreground">Cours design</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">12K+</div>
                <div className="text-sm text-muted-foreground">Designers formés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">15+</div>
                <div className="text-sm text-muted-foreground">Spécialisations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-violet-600">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Design Specialties */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Spécialisations Design</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {designSpecialties.map((specialty) => (
              <Card 
                key={specialty.name} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSpecialtyFilter(
                  specialty.name.toLowerCase().includes('ui/ux') ? 'ui/ux' :
                  specialty.name.toLowerCase().includes('branding') ? 'branding' :
                  specialty.name.toLowerCase().includes('web') ? 'web' :
                  specialty.name.toLowerCase().includes('mobile') ? 'mobile' :
                  specialty.name.toLowerCase().includes('photography') ? 'photography' :
                  specialty.name.toLowerCase().includes('tools') ? 'tools' : 'all'
                )}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2 text-purple-600">
                    {specialty.icon}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{specialty.name}</h3>
                  <p className="text-xs text-muted-foreground">{specialty.courses} cours</p>
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
                  placeholder="Rechercher par cours, instructeur ou spécialité..."
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
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="newest">Plus récents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous niveaux</SelectItem>
                  <SelectItem value="beginner">Débutant</SelectItem>
                  <SelectItem value="intermediate">Intermédiaire</SelectItem>
                  <SelectItem value="advanced">Avancé</SelectItem>
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
                  <SelectItem value="paid">Payant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">
              {filteredCourses.length} cours trouvés
            </h2>
            <Badge variant="outline" className="text-sm">
              Design
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
                <div className="absolute top-4 left-4">
                  <Badge variant={course.isLive ? "destructive" : "secondary"} className="text-xs">
                    {course.isLive ? 'Live' : 'À la demande'}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  {course.specialty && getSpecialtyIcon(course.specialty)}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" className="pointer-events-none">
                    <Play className="w-4 h-4 mr-2" />
                    Voir le cours
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.level === 'beginner' ? 'Débutant' : 
                     course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                  </Badge>
                  <div className="text-right">
                    <div className="text-xl font-bold">{course.price === 0 ? 'Gratuit' : `${course.price}€`}</div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
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
                    <span>{course.studentsCount?.toLocaleString() || course.studentCount?.toLocaleString()} étudiants</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{Math.floor(course.duration / 60)}h {course.duration % 60}m</span>
                  </div>
                </div>

                {course.tools && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.tools.slice(0, 3).map((tool: string) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                    {course.tools.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.tools.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <Button 
                  className="w-full"
                  onClick={() => onNavigate(`/courses/${course.id}`)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Voir le cours
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
                setLevelFilter('all');
                setPriceFilter('all');
                setSpecialtyFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-8">
          <h2 className="text-2xl mb-4">Partagez votre expertise créative</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Inspirez la prochaine génération de designers en partageant vos connaissances et votre créativité.
          </p>
          <Button size="lg" onClick={() => onNavigate('/teacher/signup')}>
            <Zap className="w-5 h-5 mr-2" />
            Devenir instructeur design
          </Button>
        </div>
      </div>
    </div>
  );
}