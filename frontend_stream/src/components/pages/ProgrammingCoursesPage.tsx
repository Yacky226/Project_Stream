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
  Code2,
  Terminal,
  Layers,
  Zap,
  Cpu,
  Database,
  Globe,
  Smartphone
} from 'lucide-react';

interface ProgrammingCoursesPageProps {
  onNavigate: (path: string) => void;
}

export function ProgrammingCoursesPage({ onNavigate }: ProgrammingCoursesPageProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [levelFilter, setLevelFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  // Mock programming-specific courses
  const programmingCourses = [
    {
      id: 'prog-1',
      title: 'JavaScript ES6+ Masterclass',
      description: 'Master modern JavaScript with ES6+ features, async programming, and advanced patterns.',
      instructorId: '1',
      instructorName: 'Alex Chen',
      coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=600',
      duration: 240,
      studentsCount: 3420,
      category: 'Programming',
      isLive: true,
      price: 89,
      level: 'intermediate',
      rating: 4.8,
      language: 'JavaScript',
      prerequisites: ['HTML/CSS basics', 'Basic JavaScript'],
      skills: ['ES6+', 'Promises', 'Async/Await', 'Modules']
    },
    {
      id: 'prog-2', 
      title: 'Python for Data Science',
      description: 'Learn Python programming focused on data analysis, machine learning, and visualization.',
      instructorId: '2',
      instructorName: 'Sarah Rodriguez',
      coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=600',
      duration: 320,
      studentsCount: 2890,
      category: 'Programming',
      isLive: false,
      price: 129,
      level: 'beginner',
      rating: 4.9,
      language: 'Python',
      prerequisites: ['Basic math knowledge'],
      skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Sklearn']
    },
    {
      id: 'prog-3',
      title: 'Advanced React Patterns',
      description: 'Deep dive into React with advanced patterns, performance optimization, and state management.',
      instructorId: '3',
      instructorName: 'Michael Johnson',
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600',
      duration: 180,
      studentsCount: 2156,
      category: 'Programming',
      isLive: true,
      price: 149,
      level: 'advanced',
      rating: 4.7,
      language: 'JavaScript',
      prerequisites: ['React basics', 'JavaScript ES6+'],
      skills: ['React', 'Redux', 'Context API', 'Performance', 'Testing']
    },
    {
      id: 'prog-4',
      title: 'Full Stack Node.js Development',
      description: 'Build complete web applications with Node.js, Express, and MongoDB.',
      instructorId: '4',
      instructorName: 'Emma Wilson',
      coverImage: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=600',
      duration: 280,
      studentsCount: 1876,
      category: 'Programming',
      isLive: false,
      price: 159,
      level: 'intermediate',
      rating: 4.6,
      language: 'JavaScript',
      prerequisites: ['JavaScript fundamentals', 'Basic HTML/CSS'],
      skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication']
    },
    {
      id: 'prog-5',
      title: 'Mobile App Development with React Native',
      description: 'Create cross-platform mobile apps using React Native and modern development practices.',
      instructorId: '5',
      instructorName: 'David Kim',
      coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600',
      duration: 220,
      studentsCount: 1432,
      category: 'Programming',
      isLive: true,
      price: 139,
      level: 'intermediate',
      rating: 4.5,
      language: 'JavaScript',
      prerequisites: ['React basics', 'JavaScript ES6+'],
      skills: ['React Native', 'Mobile UI', 'Navigation', 'State Management', 'Publishing']
    },
    {
      id: 'prog-6',
      title: 'Database Design and SQL Mastery',
      description: 'Master database design principles and advanced SQL for data management.',
      instructorId: '6',
      instructorName: 'Lisa Thompson',
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=600',
      duration: 200,
      studentsCount: 2341,
      category: 'Programming',
      isLive: false,
      price: 99,
      level: 'beginner',
      rating: 4.8,
      language: 'SQL',
      prerequisites: ['Basic computer skills'],
      skills: ['SQL', 'Database Design', 'Normalization', 'Indexing', 'Performance']
    }
  ];

  const allCourses = [...mockCourses.filter(c => c.category === 'Programming'), ...programmingCourses];

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

      const matchesTech = techFilter === 'all' || course.language?.toLowerCase().includes(techFilter.toLowerCase()) ||
                          course.skills?.some(skill => skill.toLowerCase().includes(techFilter.toLowerCase()));

      return matchesSearch && matchesLevel && matchesPrice && matchesTech;
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
  }, [searchTerm, sortBy, levelFilter, priceFilter, techFilter]);

  const getTechIcon = (language: string) => {
    switch (language?.toLowerCase()) {
      case 'javascript': return <Code2 className="w-5 h-5 text-yellow-500" />;
      case 'python': return <Terminal className="w-5 h-5 text-blue-500" />;
      case 'sql': return <Database className="w-5 h-5 text-green-500" />;
      case 'react': return <Layers className="w-5 h-5 text-cyan-500" />;
      default: return <Cpu className="w-5 h-5 text-purple-500" />;
    }
  };

  const programmingSkills = [
    { name: 'JavaScript', icon: <Code2 className="w-4 h-4" />, courses: 8 },
    { name: 'Python', icon: <Terminal className="w-4 h-4" />, courses: 6 },
    { name: 'React', icon: <Layers className="w-4 h-4" />, courses: 5 },
    { name: 'Node.js', icon: <Globe className="w-4 h-4" />, courses: 4 },
    { name: 'Mobile Dev', icon: <Smartphone className="w-4 h-4" />, courses: 3 },
    { name: 'Databases', icon: <Database className="w-4 h-4" />, courses: 4 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center mb-6">
              <Code2 className="w-8 h-8 text-blue-600 mr-3" />
              <span className="text-blue-600 font-medium">Programmation</span>
            </div>
            <h1 className="text-4xl mb-6">
              Maîtrisez la Programmation
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Apprenez les langages et technologies les plus demandés avec nos cours de programmation, 
              du niveau débutant aux techniques avancées.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-sm text-muted-foreground">Cours disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15K+</div>
                <div className="text-sm text-muted-foreground">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">20+</div>
                <div className="text-sm text-muted-foreground">Technologies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-muted-foreground">Taux de réussite</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Popular Technologies */}
        <div className="mb-8">
          <h2 className="text-2xl mb-6">Technologies Populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {programmingSkills.map((skill) => (
              <Card 
                key={skill.name} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setTechFilter(skill.name.toLowerCase().includes('javascript') ? 'javascript' : 
                                            skill.name.toLowerCase().includes('python') ? 'python' :
                                            skill.name.toLowerCase().includes('react') ? 'react' :
                                            skill.name.toLowerCase().includes('node') ? 'node' :
                                            skill.name.toLowerCase().includes('mobile') ? 'mobile' :
                                            skill.name.toLowerCase().includes('database') ? 'database' : 'all')}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2 text-blue-600">
                    {skill.icon}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{skill.name}</h3>
                  <p className="text-xs text-muted-foreground">{skill.courses} cours</p>
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
                  placeholder="Rechercher par cours, instructeur ou technologie..."
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
              Programmation
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
                  {course.language && getTechIcon(course.language)}
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
                setTechFilter('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-8">
          <h2 className="text-2xl mb-4">Envie d'enseigner la programmation ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Partagez vos connaissances en programmation avec notre communauté grandissante d'apprenants passionnés.
          </p>
          <Button size="lg" onClick={() => onNavigate('/teacher/signup')}>
            <Zap className="w-5 h-5 mr-2" />
            Devenir instructeur
          </Button>
        </div>
      </div>
    </div>
  );
}