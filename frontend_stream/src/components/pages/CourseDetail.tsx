import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { VideoPlayer } from '../video/VideoPlayer';
import { useTranslation } from '../../lib/i18n';
import { useAuth, mockCourses, type Course, type User } from '../../lib/auth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Calendar, 
  CheckCircle,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Award,
  Globe
} from 'lucide-react';

interface CourseDetailProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export function CourseDetail({ courseId, onNavigate }: CourseDetailProps) {
  const { t } = useTranslation();
  const { getCurrentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    setUser(getCurrentUser());
    
    // Find course
    const foundCourse = mockCourses.find(c => c.id === courseId);
    setCourse(foundCourse || null);
    
    // Mock enrollment status
    setIsEnrolled(true);
    
    // Mock lessons
    setLessons([
      {
        id: '1',
        title: 'Introduction à React',
        duration: 15,
        isCompleted: true,
        isLocked: false,
        type: 'video'
      },
      {
        id: '2',
        title: 'Composants et Props',
        duration: 22,
        isCompleted: true,
        isLocked: false,
        type: 'video'
      },
      {
        id: '3',
        title: 'Gestion de l\'état avec useState',
        duration: 18,
        isCompleted: false,
        isLocked: false,
        type: 'video'
      },
      {
        id: '4',
        title: 'Session Live - Hooks Avancés',
        duration: 60,
        isCompleted: false,
        isLocked: false,
        type: 'live',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
      },
      {
        id: '5',
        title: 'Exercices pratiques',
        duration: 30,
        isCompleted: false,
        isLocked: true,
        type: 'exercise'
      }
    ]);

    // Mock reviews
    setReviews([
      {
        id: '1',
        userName: 'Marie Dubois',
        rating: 5,
        comment: 'Excellent cours ! Sarah explique très clairement les concepts React.',
        date: new Date('2024-01-15')
      },
      {
        id: '2',
        userName: 'Pierre Martin',
        rating: 4,
        comment: 'Très bon contenu, les exemples pratiques sont très utiles.',
        date: new Date('2024-01-10')
      },
      {
        id: '3',
        userName: 'Sophie Chen',
        rating: 5,
        comment: 'Les sessions live sont fantastiques, interaction excellente avec l\'instructeur.',
        date: new Date('2024-01-08')
      }
    ]);

    // Set active lesson to first incomplete or first lesson
    const firstIncomplete = lessons.find(l => !l.isCompleted && !l.isLocked);
    setActiveLesson(firstIncomplete || lessons[0]);
  }, [courseId]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-green-500" />;
    
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'live': return <Calendar className="w-4 h-4 text-red-500" />;
      case 'exercise': return <BookOpen className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const handleEnroll = () => {
    if (user) {
      setIsEnrolled(true);
      // In real app, this would make an API call
    } else {
      onNavigate('/auth/signin');
    }
  };

  const handleJoinLive = () => {
    if (course?.nextSession) {
      onNavigate(`/courses/${courseId}/session/${course.nextSession.id}`);
    }
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl">Cours non trouvé</h1>
          <Button onClick={() => onNavigate('/catalog')} className="mt-4">
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const totalLessons = lessons.length;
  const progressPercentage = (completedLessons / totalLessons) * 100;

  return (
    <div className="min-h-screen">
      {/* Course Header */}
      <div className="bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('/catalog')}
                  className="p-0"
                >
                  ← Retour au catalogue
                </Button>
              </div>
              
              <h1 className="text-3xl lg:text-4xl mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground ml-1">({reviews.length} avis)</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-1" />
                  <span>{course.studentCount.toLocaleString()} étudiants</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                
                <Badge>{course.level}</Badge>
                {course.isLive && (
                  <Badge className="bg-red-500">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    Live disponible
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {course.instructorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{course.instructorName}</p>
                  <p className="text-sm text-muted-foreground">Instructeur certifié</p>
                </div>
              </div>
            </div>
            
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="relative mb-4">
                    <ImageWithFallback 
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {course.isLive && course.nextSession && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Button 
                          onClick={handleJoinLive}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Session Live dans 2h
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold mb-2">{course.price}€</div>
                    {!isEnrolled ? (
                      <Button onClick={handleEnroll} className="w-full mb-3">
                        S'inscrire au cours
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Progression: {completedLessons}/{totalLessons} leçons
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <Button onClick={() => setActiveLesson(lessons[0])} className="w-full">
                          Continuer le cours
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex justify-center space-x-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Niveau:</span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durée:</span>
                      <span>{formatDuration(course.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Certificat:</span>
                      <span>Oui</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Langues:</span>
                      <span>FR, EN</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        {isEnrolled && activeLesson && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{activeLesson.title}</span>
                  <Badge>{activeLesson.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer 
                  title={activeLesson.title}
                  isLive={activeLesson.type === 'live'}
                  src={activeLesson.type === 'live' ? undefined : "sample-video.m3u8"}
                  className="aspect-video mb-4"
                />
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contenu du cours</CardTitle>
                <CardDescription>
                  {totalLessons} leçons • {formatDuration(course.duration)} au total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                        activeLesson?.id === lesson.id ? 'bg-muted border-primary' : ''
                      } ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !lesson.isLocked && setActiveLesson(lesson)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground w-6">
                          {index + 1}.
                        </span>
                        {getLessonIcon(lesson.type, lesson.isCompleted)}
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          {lesson.scheduledTime && (
                            <p className="text-xs text-muted-foreground">
                              Programmé: {lesson.scheduledTime.toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(lesson.duration)}
                        </span>
                        {lesson.type === 'live' && (
                          <Badge variant="outline" className="text-red-500">Live</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>À propos de ce cours</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>{course.description}</p>
                
                <h3>Ce que vous apprendrez</h3>
                <ul>
                  <li>Les fondamentaux de React et JSX</li>
                  <li>Gestion de l'état avec hooks</li>
                  <li>Création de composants réutilisables</li>
                  <li>Interaction avec des APIs</li>
                  <li>Bonnes pratiques et patterns</li>
                </ul>
                
                <h3>Prérequis</h3>
                <ul>
                  <li>Connaissance de base de JavaScript</li>
                  <li>Familiarité avec HTML et CSS</li>
                  <li>Expérience avec Node.js (recommandé)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis des étudiants</CardTitle>
                <CardDescription>
                  Note moyenne: {averageRating.toFixed(1)}/5 ({reviews.length} avis)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.date.toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="discussions">
            <Card>
              <CardHeader>
                <CardTitle>Forum de discussion</CardTitle>
                <CardDescription>
                  Posez vos questions et échangez avec les autres étudiants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Les discussions seront bientôt disponibles
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}