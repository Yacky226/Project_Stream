import { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { StatsGrid, StatCard } from '../layout/StatsGrid';
import { SectionHeader } from '../layout/SectionHeader';
import { EmptyState } from '../layout/EmptyState';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { QuickLiveActions } from '../live/QuickLiveActions';
import { 
  Calendar, 
  Users, 
  PlayCircle, 
  Plus, 
  Video, 
  BarChart, 
  TrendingUp,
  Star,
  Radio,
  Monitor,
  DollarSign,
  Award,
  Eye,
  Edit,
  Settings,
  Clock,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (path: string) => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  students: number;
  rating: number;
  views: number;
  isLive: boolean;
  nextSession?: string;
  duration: string;
  status: 'published' | 'draft' | 'scheduled';
}

interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  scheduledTime: Date;
  status: 'upcoming' | 'live' | 'ended';
  viewers: number;
}

export function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);

  // Mock data
  const courses: Course[] = [
    {
      id: '1',
      title: 'React Hooks Avancés',
      description: 'Maîtrisez les hooks React pour des applications performantes',
      category: 'Frontend',
      level: 'Intermédiaire',
      thumbnail: '',
      students: 156,
      rating: 4.8,
      views: 2341,
      isLive: false,
      nextSession: '2024-01-20T14:00:00Z',
      duration: '2h 30min',
      status: 'published'
    },
    {
      id: '2',
      title: 'TypeScript Masterclass',
      description: 'Développement moderne avec TypeScript',
      category: 'Backend',
      level: 'Avancé',
      thumbnail: '',
      students: 89,
      rating: 4.9,
      views: 1567,
      isLive: true,
      duration: '3h',
      status: 'published'
    }
  ];

  const upcomingSessions: LiveSession[] = [
    {
      id: '1',
      courseId: '1',
      title: 'React Hooks - Session 5',
      scheduledTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      status: 'upcoming',
      viewers: 0
    },
    {
      id: '2',
      courseId: '2',
      title: 'TypeScript Advanced Patterns',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'upcoming',
      viewers: 0
    }
  ];

  const recentStudents = [
    { id: '1', name: 'Alice Martin', course: 'React Hooks Avancés', joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: '2', name: 'Bob Laurent', course: 'TypeScript Masterclass', joinedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: '3', name: 'Claire Dubois', course: 'React Hooks Avancés', joinedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  ];

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Dashboard Enseignant"
        description="Gérez vos cours, sessions live et étudiants"
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => onNavigate('/teacher/live-sessions')}
              className="w-full sm:w-auto"
            >
              <Radio className="h-4 w-4 mr-2" />
              Gérer les Lives
            </Button>
            <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Cours
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau cours</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer votre cours
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Fonctionnalité en cours de développement...
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      {/* Stats Cards */}
      <StatsGrid columns={4} className="mb-8">
        <StatCard
          title="Total étudiants"
          value="245"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          description="+29 ce mois"
        />
        <StatCard
          title="Revenus du mois"
          value="3,456€"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Note moyenne"
          value="4.8"
          icon={Star}
          description="Sur 5.0"
        />
        <StatCard
          title="Cours publiés"
          value={courses.filter(c => c.status === 'published').length}
          icon={BookOpen}
          description={`${courses.filter(c => c.status === 'draft').length} brouillons`}
        />
      </StatsGrid>

      {/* Quick Actions for Live */}
      <Card className="mb-6 lg:mb-8 overflow-hidden border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Radio className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Streaming en Direct</CardTitle>
              <CardDescription>Actions rapides pour vos sessions live</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <QuickLiveActions courseId="all" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="courses">Mes Cours ({courses.length})</TabsTrigger>
          <TabsTrigger value="students">Étudiants</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sessions Live à venir */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Prochaines Sessions Live</CardTitle>
                      <CardDescription>Vos sessions planifiées</CardDescription>
                    </div>
                    <Badge variant="outline" className="hidden sm:flex">
                      {upcomingSessions.length} planifiées
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingSessions.length === 0 ? (
                    <div className="p-8">
                      <EmptyState
                        icon={Video}
                        title="Aucune session planifiée"
                        description="Créez votre première session live pour commencer"
                        action={{
                          label: 'Planifier une session',
                          onClick: () => onNavigate('/teacher/live-sessions')
                        }}
                      />
                    </div>
                  ) : (
                    <div className="divide-y">
                      {upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 sm:p-5 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{session.title}</h4>
                                {session.status === 'live' && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    <Radio className="h-3 w-3 mr-1" />
                                    En direct
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatDateTime(session.scheduledTime)}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>{session.viewers} spectateurs</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
                                className="flex-1 sm:flex-none"
                              >
                                <Settings className="h-3.5 w-3.5 mr-1.5" />
                                <span className="sm:inline">Configurer</span>
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => onNavigate(`/teacher/live/${session.courseId}/${session.id}`)}
                                className="flex-1 sm:flex-none"
                              >
                                <Monitor className="h-3.5 w-3.5 mr-1.5" />
                                <span className="sm:inline">Démarrer</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mes Cours */}
              <div>
                <SectionHeader
                  title="Mes Cours"
                  description="Gérez et suivez vos cours"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTab('courses')}>
                      Voir tout
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  }
                />

                {courses.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <EmptyState
                        icon={BookOpen}
                        title="Aucun cours créé"
                        description="Commencez à partager vos connaissances en créant votre premier cours"
                        action={{
                          label: 'Créer un cours',
                          onClick: () => setShowCreateCourse(true)
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {courses.slice(0, 4).map((course) => (
                      <Card
                        key={course.id}
                        className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => onNavigate(`/courses/${course.id}`)}
                      >
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-2">
                            <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                              {course.status === 'published' ? 'Publié' : 
                               course.status === 'draft' ? 'Brouillon' : 'Planifié'}
                            </Badge>
                            {course.isLive && (
                              <Badge variant="destructive" className="animate-pulse">
                                <Radio className="h-3 w-3 mr-1" />
                                Live
                              </Badge>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-4 sm:p-5">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-2 mb-3">
                            {course.title}
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Users className="h-3.5 w-3.5" />
                              </div>
                              <p className="text-sm sm:text-base font-semibold">{course.students}</p>
                              <p className="text-xs text-muted-foreground">Étudiants</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                              </div>
                              <p className="text-sm sm:text-base font-semibold">{course.rating}</p>
                              <p className="text-xs text-muted-foreground">Note</p>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Eye className="h-3.5 w-3.5" />
                              </div>
                              <p className="text-sm sm:text-base font-semibold">{course.views}</p>
                              <p className="text-xs text-muted-foreground">Vues</p>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Modifier
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Nouveaux étudiants */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Nouveaux étudiants</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentStudents.map((student) => (
                      <div key={student.id} className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{student.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{student.course}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatTimeAgo(student.joinedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedTab('students')}
                    >
                      Voir tous les étudiants
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics rapides */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Statistiques de la semaine</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Vues totales</span>
                    </div>
                    <span className="font-semibold">+1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Nouveaux étudiants</span>
                    </div>
                    <span className="font-semibold">+29</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Temps de visionnage</span>
                    </div>
                    <span className="font-semibold">127h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Nouveaux avis</span>
                    </div>
                    <span className="font-semibold">+8</span>
                  </div>
                </CardContent>
              </Card>

              {/* Performance */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Performance du mois</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">92%</div>
                      <p className="text-sm text-muted-foreground">Taux de satisfaction</p>
                      <Badge variant="outline" className="mt-2">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +5% vs mois dernier
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Vue Cours */}
        <TabsContent value="courses" className="space-y-6">
          <SectionHeader
            title="Tous mes cours"
            description={`${courses.length} cours au total`}
            action={
              <Button onClick={() => setShowCreateCourse(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Cours
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onNavigate(`/courses/${course.id}`)}
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 mb-2">{course.title}</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="font-semibold">{course.students}</p>
                      <p className="text-xs text-muted-foreground">Étudiants</p>
                    </div>
                    <div>
                      <p className="font-semibold">{course.rating}</p>
                      <p className="text-xs text-muted-foreground">Note</p>
                    </div>
                    <div>
                      <p className="font-semibold">{course.views}</p>
                      <p className="text-xs text-muted-foreground">Vues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vue Étudiants */}
        <TabsContent value="students" className="space-y-6">
          <SectionHeader
            title="Tous les étudiants"
            description={`${recentStudents.length} étudiants inscrits`}
          />
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentStudents.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.course}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(student.joinedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
