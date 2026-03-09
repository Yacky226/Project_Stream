import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { PageContainer } from '../layout/PageContainer';
import { PageHeader } from '../layout/PageHeader';
import { StatsGrid, StatCard } from '../layout/StatsGrid';
import { SectionHeader } from '../layout/SectionHeader';
import { EmptyState } from '../layout/EmptyState';
import { useTranslation } from '../../lib/i18n';
import { useAuth } from '../../hooks/useAuth';
import { mockCourses } from '../../lib/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Course } from '../../types/course';
import { 
  Play, 
  Clock, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Award,
  Video,
  Star,
  ChevronRight,
  Activity,
  BarChart3,
  Bookmark,
  Target,
  Trophy,
  Flame,
  GraduationCap
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (path: string) => void;
}

export function StudentDashboard({ onNavigate }: StudentDashboardProps) {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simuler le chargement des données
    setEnrolledCourses([
      {
        ...mockCourses[0],
        progress: 65,
        lastAccessed: new Date(),
        nextLesson: 'React Hooks Deep Dive'
      },
      {
        ...mockCourses[1],
        progress: 30,
        lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextLesson: 'Variables and Functions'
      }
    ]);
    
    setUpcomingSessions([
      {
        id: '1',
        title: 'Introduction to React - Session 3',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        instructor: 'Sarah Johnson',
        courseId: '1',
        thumbnail: mockCourses[0].thumbnail
      },
      {
        id: '2',
        title: 'UX Design Fundamentals - Live Workshop',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        instructor: 'Emma Rodriguez',
        courseId: '3',
        thumbnail: mockCourses[2]?.thumbnail
      }
    ]);

    setRecentActivity([
      {
        id: '1',
        type: 'completed',
        title: 'Completed: JavaScript Basics - Lesson 5',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'watched',
        title: 'Watched: React Components Deep Dive',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: '3',
        type: 'joined',
        title: 'Joined Live Session: State Management',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }
    ]);
  }, []);

  if (!user && !isLoading) {
    return (
      <PageContainer>
        <EmptyState
          icon={GraduationCap}
          title="Veuillez vous connecter"
          description="Connectez-vous pour accéder à votre tableau de bord étudiant"
          action={{
            label: 'Se connecter',
            onClick: () => onNavigate('/auth/signin')
          }}
        />
      </PageContainer>
    );
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <PageContainer>
      {/* Header avec bienvenue */}
      <PageHeader
        title={`Bienvenue, ${user?.firstName || 'Étudiant'} !`}
        description="Voici un aperçu de votre progression et de vos activités récentes"
      />

      {/* Stats Cards */}
      <StatsGrid columns={4} className="mb-8">
        <StatCard
          title="Cours suivis"
          value={enrolledCourses.length}
          icon={BookOpen}
          description="+2 ce mois"
        />
        <StatCard
          title="Heures d'apprentissage"
          value="24h"
          icon={Clock}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Série en cours"
          value="7 jours"
          icon={Flame}
          description="Record: 14 jours"
        />
        <StatCard
          title="Certifications"
          value="3"
          icon={Award}
          description="5 en cours"
        />
      </StatsGrid>

      {/* Tabs pour différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="courses">Mes Cours</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
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
                      <CardTitle className="text-lg sm:text-xl">Sessions Live à venir</CardTitle>
                      <CardDescription>Ne manquez pas vos prochains cours en direct</CardDescription>
                    </div>
                    <Badge variant="destructive" className="hidden sm:flex">
                      <Video className="h-3 w-3 mr-1" />
                      {upcomingSessions.length} Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {upcomingSessions.length === 0 ? (
                    <div className="p-8 text-center">
                      <EmptyState
                        icon={Video}
                        title="Aucune session planifiée"
                        description="Explorez le catalogue pour découvrir les prochaines sessions live"
                        action={{
                          label: 'Explorer les cours',
                          onClick: () => onNavigate('/catalog')
                        }}
                      />
                    </div>
                  ) : (
                    <div className="divide-y">
                      {upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-4 sm:p-5 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => onNavigate(`/courses/${session.courseId}/session/${session.id}`)}
                        >
                          <div className="flex gap-4">
                            <div className="hidden sm:block aspect-video w-28 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={session.thumbnail}
                                alt={session.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold line-clamp-2 text-sm sm:text-base">
                                  {session.title}
                                </h4>
                                <Badge variant="outline" className="flex-shrink-0 sm:hidden">Live</Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatDateTime(session.startTime)}</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span>{session.instructor}</span>
                              </div>
                              <Button size="sm" className="mt-3 w-full sm:w-auto">
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Rejoindre
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Continuer l'apprentissage */}
              <div>
                <SectionHeader
                  title="Continuer l'apprentissage"
                  description="Reprendre là où vous vous êtes arrêté"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => onNavigate('/catalog')}>
                      Voir tout
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  }
                />

                {enrolledCourses.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <EmptyState
                        icon={BookOpen}
                        title="Aucun cours en cours"
                        description="Commencez votre parcours d'apprentissage dès aujourd'hui"
                        action={{
                          label: 'Explorer les cours',
                          onClick: () => onNavigate('/catalog')
                        }}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {enrolledCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => onNavigate(`/courses/${course.id}`)}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <ImageWithFallback
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                            <Badge variant="secondary">{course.level}</Badge>
                          </div>
                        </div>
                        <CardContent className="p-4 sm:p-5">
                          <h4 className="font-semibold text-sm sm:text-base line-clamp-2 mb-2">
                            {course.title}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground">Progression</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Prochain: {course.nextLesson}
                            </p>
                          </div>
                          <Button className="w-full mt-4" size="sm">
                            <Play className="h-3.5 w-3.5 mr-1.5" />
                            Continuer
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
              {/* Activité récente */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Activité récente</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {recentActivity.length === 0 ? (
                    <div className="p-6 text-center">
                      <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              activity.type === 'completed' ? 'bg-green-100 text-green-600' :
                              activity.type === 'watched' ? 'bg-blue-100 text-blue-600' :
                              activity.type === 'joined' ? 'bg-purple-100 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {activity.type === 'completed' && <Target className="h-4 w-4" />}
                              {activity.type === 'watched' && <Play className="h-4 w-4" />}
                              {activity.type === 'joined' && <Video className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm line-clamp-2">
                                {activity.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(activity.time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-3 border-t">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir toute l'activité
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Objectifs de la semaine</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Heures d'étude</span>
                      <span className="font-medium">8/10h</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Leçons complétées</span>
                      <span className="font-medium">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sessions live</span>
                      <span className="font-medium">2/3</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-base sm:text-lg">Dernières réussites</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {[
                    { icon: '🎯', title: 'Premier cours terminé', date: 'Il y a 2 jours' },
                    { icon: '🔥', title: 'Série de 7 jours', date: 'Aujourd\'hui' },
                    { icon: '⭐', title: 'Note parfaite au quiz', date: 'Il y a 5 jours' }
                  ].map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <Trophy className="h-3.5 w-3.5 mr-1.5" />
                    Voir toutes les réussites
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Vue Mes Cours */}
        <TabsContent value="courses" className="space-y-6">
          <SectionHeader
            title="Mes cours"
            description={`${enrolledCourses.length} cours en cours`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {enrolledCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onNavigate(`/courses/${course.id}`)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <ImageWithFallback
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold line-clamp-2 mb-3">{course.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Vue Activité */}
        <TabsContent value="activity" className="space-y-6">
          <SectionHeader
            title="Historique d'activité"
            description="Toutes vos actions récentes"
          />
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'completed' ? 'bg-green-100 text-green-600' :
                        activity.type === 'watched' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'completed' && <Target className="h-5 w-5" />}
                        {activity.type === 'watched' && <Play className="h-5 w-5" />}
                        {activity.type === 'joined' && <Video className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                      </div>
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
