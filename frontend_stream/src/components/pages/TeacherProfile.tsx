import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useAppSelector } from '../../hooks/redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  ArrowLeft,
  Star, 
  Users, 
  BookOpen, 
  Clock, 
  MapPin, 
  Briefcase, 
  Award, 
  Heart, 
  Share2, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Play,
  Calendar,
  Globe,
  Linkedin,
  Github,
  Twitter,
  CheckCircle,
  TrendingUp,
  Target,
  Lightbulb,
  Zap,
  ThumbsUp,
  Video,
  Download,
  Shield,
  Quote
} from 'lucide-react';

interface TeacherProfileProps {
  teacherId: string;
  onNavigate: (path: string) => void;
}

export function TeacherProfile({ teacherId, onNavigate }: TeacherProfileProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Enhanced mock teacher data
  const teacher = {
    id: teacherId,
    name: 'Sarah Martin',
    title: 'Développeuse Frontend Senior & Formatrice',
    specialty: 'Développement Frontend React/TypeScript',
    bio: 'Développeuse senior avec 8 ans d\'expérience en React et TypeScript. Passionnée par l\'enseignement et les nouvelles technologies web. J\'ai travaillé dans des startups innovantes et grandes entreprises tech, et je partage maintenant mon expérience à travers des cours pratiques et des projets concrets.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1743796055664-3473eedab36e?w=1200&h=400&fit=crop',
    rating: 4.8,
    totalStudents: 12450,
    totalCourses: 18,
    reviewCount: 1156,
    joinDate: '2022-03-15',
    location: 'Paris, France',
    company: 'Tech Innovation Corp',
    experience: '8+ ans',
    responseTime: '2h en moyenne',
    languages: ['Français', 'Anglais', 'Espagnol'],
    timezone: 'UTC+1 (CET)',
    isVerified: true,
    isOnline: true,
    lastSeen: '5 min',
    expertise: [
      { skill: 'React', level: 95, years: 6 },
      { skill: 'TypeScript', level: 90, years: 5 },
      { skill: 'JavaScript', level: 95, years: 8 },
      { skill: 'Next.js', level: 85, years: 3 },
      { skill: 'Node.js', level: 80, years: 4 },
      { skill: 'CSS3/Sass', level: 90, years: 7 },
      { skill: 'GraphQL', level: 75, years: 2 },
      { skill: 'MongoDB', level: 70, years: 3 }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahmartin',
      github: 'https://github.com/sarahmartin',
      twitter: 'https://twitter.com/sarahmartin',
      website: 'https://sarahmartin.dev'
    },
    achievements: [
      { title: 'Certifiée React Advanced', year: '2023', issuer: 'Meta' },
      { title: 'Speaker à React Conference', year: '2023', issuer: 'React Conf' },
      { title: 'Contributrice Open Source', year: '2022', issuer: 'GitHub' },
      { title: 'Top Instructor Award', year: '2023', issuer: 'Stream Éducatif' },
      { title: 'TypeScript Expert', year: '2022', issuer: 'Microsoft' }
    ],
    stats: {
      totalHoursTeaching: 2450,
      avgResponseTime: '2h',
      studentSatisfaction: 98,
      courseCompletion: 87,
      repeatStudents: 45
    },
    courses: [
      {
        id: '1',
        title: 'React Hooks Avancés',
        description: 'Maîtrisez les hooks React pour créer des applications performantes et maintenables',
        level: 'Intermédiaire',
        duration: '8h 30min',
        students: 1456,
        rating: 4.8,
        price: 49.99,
        thumbnail: 'https://images.unsplash.com/photo-1588912914078-2fe5224fd8b8?w=400&h=250&fit=crop',
        category: 'Frontend',
        isLive: false,
        isBestseller: true,
        lastUpdated: '2024-01-15',
        lessons: 24,
        projects: 3
      },
      {
        id: '2',
        title: 'TypeScript Masterclass',
        description: 'Apprenez TypeScript de A à Z avec des projets pratiques et des cas d\'usage réels',
        level: 'Avancé',
        duration: '12h 15min',
        students: 923,
        rating: 4.9,
        price: 69.99,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
        category: 'Programming',
        isLive: true,
        isBestseller: false,
        lastUpdated: '2024-01-20',
        lessons: 36,
        projects: 5
      },
      {
        id: '3',
        title: 'Next.js pour les Développeurs React',
        description: 'Créez des applications full-stack performantes avec Next.js et les dernières fonctionnalités',
        level: 'Intermédiaire',
        duration: '10h 45min',
        students: 634,
        rating: 4.7,
        price: 59.99,
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        category: 'Full-Stack',
        isLive: false,
        isBestseller: false,
        lastUpdated: '2024-01-18',
        lessons: 28,
        projects: 4
      }
    ],
    reviews: [
      {
        id: '1',
        student: 'Marie Dubois',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        date: '2024-01-20',
        course: 'React Hooks Avancés',
        comment: 'Excellente formatrice ! Sarah explique les concepts complexes de manière très claire. Les projets pratiques sont vraiment utiles pour comprendre.',
        helpful: 23
      },
      {
        id: '2',
        student: 'Thomas Bernard',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        date: '2024-01-18',
        course: 'TypeScript Masterclass',
        comment: 'Formation de très haute qualité. J\'ai enfin compris TypeScript grâce à cette formation. Merci Sarah !',
        helpful: 18
      },
      {
        id: '3',
        student: 'Julie Lambert',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        date: '2024-01-15',
        course: 'Next.js pour les Développeurs React',
        comment: 'Très bon cours, bien structuré. Quelques parties pourraient être plus détaillées mais globalement excellent.',
        helpful: 12
      }
    ]
  };

  const CourseCard = ({ course }: { course: any }) => (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
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
              <Badge className="bg-red-600 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                LIVE
              </Badge>
            )}
            {course.isBestseller && (
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Bestseller
              </Badge>
            )}
          </div>

          {/* Quick Preview */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="lg" className="bg-white/90 text-gray-900 hover:bg-white">
              <Play className="w-5 h-5 mr-2" />
              Aperçu
            </Button>
          </div>

          {/* Duration */}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration}
            </Badge>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <Badge variant={
            course.level === 'Débutant' ? 'secondary' :
            course.level === 'Intermédiaire' ? 'default' : 'destructive'
          }>
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
              <BookOpen className="w-4 h-4 mr-1" />
              {course.lessons} leçons
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1" />
              {course.projects} projets
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
            <span className="font-medium">{course.rating}</span>
            <span className="text-muted-foreground ml-1">({course.students})</span>
          </div>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            {course.price}€
          </div>
          <Button 
            className="group-hover:shadow-lg transition-shadow"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/courses/${course.id}`);
            }}
          >
            Voir le cours
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ReviewCard = ({ review }: { review: any }) => (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={review.avatar} />
          <AvatarFallback>{review.student[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium">{review.student}</p>
              <p className="text-sm text-muted-foreground">{review.course}</p>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg mb-3 relative">
            <Quote className="absolute top-2 left-2 w-4 h-4 text-muted-foreground" />
            <p className="text-sm leading-relaxed pl-6">"{review.comment}"</p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{new Date(review.date).toLocaleDateString('fr-FR')}</span>
            <Button variant="ghost" size="sm">
              <ThumbsUp className="w-3 h-3 mr-1" />
              Utile ({review.helpful})
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Cover */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <ImageWithFallback 
          src={teacher.coverImage}
          alt={`Profil de ${teacher.name}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-6 left-6">
          <Button 
            variant="secondary"
            onClick={() => onNavigate('/search')}
            className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la recherche
          </Button>
        </div>

        {/* Teacher Info Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                <AvatarImage src={teacher.avatar} />
                <AvatarFallback className="text-2xl">{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {teacher.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
              {teacher.isOnline && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{teacher.name}</h1>
                {teacher.isVerified && (
                  <Badge className="bg-blue-600">
                    <Shield className="w-3 h-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-xl font-medium mb-2 text-blue-100">{teacher.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {teacher.location}
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {teacher.company}
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {teacher.languages.join(', ')}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {teacher.isOnline ? 'En ligne' : `Vu ${teacher.lastSeen}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Quick Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-6 rounded-xl shadow-lg">
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{teacher.rating}</div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                    Note ({teacher.reviewCount})
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{teacher.totalStudents.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Étudiants</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{teacher.totalCourses}</div>
                  <div className="text-sm text-muted-foreground">Cours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{teacher.stats.totalHoursTeaching}h</div>
                  <div className="text-sm text-muted-foreground">Enseignement</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                onClick={() => setIsFollowing(!isFollowing)}
                variant={isFollowing ? "outline" : "default"}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                {isFollowing ? 'Suivi' : 'Suivre'}
              </Button>
              <Button variant="outline" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 h-12 mb-8">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="courses">Cours ({teacher.courses.length})</TabsTrigger>
              <TabsTrigger value="reviews">Avis ({teacher.reviewCount})</TabsTrigger>
              <TabsTrigger value="about">À propos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Bio & Stats */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">À propos de {teacher.name.split(' ')[0]}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{teacher.bio}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <Badge variant="secondary" className="flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {teacher.experience}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Répond en {teacher.responseTime}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {teacher.timezone}
                      </Badge>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4">
                      {teacher.socialLinks.linkedin && (
                        <Button variant="outline" size="sm" onClick={() => window.open(teacher.socialLinks.linkedin, '_blank')}>
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                      {teacher.socialLinks.github && (
                        <Button variant="outline" size="sm" onClick={() => window.open(teacher.socialLinks.github, '_blank')}>
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </Button>
                      )}
                      {teacher.socialLinks.website && (
                        <Button variant="outline" size="sm" onClick={() => window.open(teacher.socialLinks.website, '_blank')}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Portfolio
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Performance Stats */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Satisfaction étudiants</span>
                        <span className="font-medium">{teacher.stats.studentSatisfaction}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${teacher.stats.studentSatisfaction}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Cours terminés</span>
                        <span className="font-medium">{teacher.stats.courseCompletion}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${teacher.stats.courseCompletion}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Étudiants récurrents</span>
                        <span className="font-medium">{teacher.stats.repeatStudents}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${teacher.stats.repeatStudents}%` }}
                        ></div>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Actions rapides</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer un message
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Planifier un call
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        CV & Portfolio
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Expertise */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Expertise technique</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {teacher.expertise.map(skill => (
                    <div key={skill.skill} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-sm text-muted-foreground">{skill.years} ans • {skill.level}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Reviews Preview */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Avis récents</h2>
                  <Button variant="outline" onClick={() => setActiveTab('reviews')}>
                    Voir tous les avis
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid gap-6">
                  {teacher.reviews.slice(0, 2).map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Cours de {teacher.name.split(' ')[0]}</h2>
                  <p className="text-muted-foreground">{teacher.courses.length} cours disponibles • {teacher.totalStudents.toLocaleString()} étudiants au total</p>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {teacher.courses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Avis des étudiants</h2>
                  <p className="text-muted-foreground">{teacher.reviewCount} avis • Note moyenne {teacher.rating}/5</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{teacher.rating}</div>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(teacher.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{teacher.reviewCount} avis</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {teacher.reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-primary" />
                      Certifications & Réalisations
                    </h3>
                    <div className="space-y-4">
                      {teacher.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">{achievement.issuer} • {achievement.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                      Méthode d'enseignement
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Apprentissage par la pratique avec projets réels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Support personnalisé et feedback détaillé</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Sessions Q&A en direct chaque semaine</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Communauté d'entraide entre étudiants</span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      Disponibilité
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Fuseau horaire</span>
                        <span className="font-medium">{teacher.timezone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Temps de réponse</span>
                        <span className="font-medium">{teacher.responseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Langues</span>
                        <span className="font-medium">{teacher.languages.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Statut</span>
                        <Badge variant={teacher.isOnline ? "default" : "secondary"}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${teacher.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          {teacher.isOnline ? 'En ligne' : 'Hors ligne'}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-primary" />
                      Spécialisations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.expertise.slice(0, 6).map(skill => (
                        <Badge key={skill.skill} variant="secondary" className="text-sm">
                          {skill.skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Section */}
          <Card className="p-8 text-center bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20 mt-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Prêt à apprendre avec {teacher.name.split(' ')[0]} ?</h3>
              <p className="text-muted-foreground mb-8">
                Rejoignez les {teacher.totalStudents.toLocaleString()} étudiants qui ont déjà choisi {teacher.name.split(' ')[0]} pour développer leurs compétences
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => onNavigate('/catalog')}
                  className="px-8"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Voir tous ses cours
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onNavigate('/contact')}
                  className="px-8"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contacter {teacher.name.split(' ')[0]}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}