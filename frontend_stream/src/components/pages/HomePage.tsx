import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useI18n } from '../../hooks/useI18n';
import { useAuth } from '../../hooks/useAuth';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useGetActiveSessionsQuery, useGetCoursesQuery } from '../../store/api/liveApi';
import { mapCoursesToCardModels, type CourseCardModel } from '../../lib/coursePresentation';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Video, 
  ArrowRight,
  Zap,
  Shield,
  Award,
  Sparkles,
  CheckCircle,
  Infinity,
  Target,
  Brain,
  Headphones,
  Monitor
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: courses = [] } = useGetCoursesQuery();
  const { data: activeSessions = [] } = useGetActiveSessionsQuery();
  const [featuredCourses, setFeaturedCourses] = useState<CourseCardModel[]>([]);

  useEffect(() => {
    const normalized = mapCoursesToCardModels(courses, activeSessions)
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 3);
    setFeaturedCourses(normalized);
  }, [courses, activeSessions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const CourseCard = ({ course }: { course: CourseCardModel }) => (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-muted/30 cursor-pointer transform hover:-translate-y-2"
          onClick={() => onNavigate(`/courses/${course.id}`)}>
      <div className="relative overflow-hidden">
        <ImageWithFallback 
          src={course.coverImage}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {course.isLive && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
            {t('home.courses.live')}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-900 shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300"
          >
            <Play className="w-4 h-4 mr-1" />
            {course.isLive ? t('home.courses.join') : t('home.courses.discover')}
          </Button>
        </div>
        
        {/* Price Badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-900 shadow-lg">
            {course.price === 0 ? t('home.courses.free') : `${course.price}€`}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-muted-foreground mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {course.studentCount.toLocaleString()}
            </div>
          </div>
          <div className="flex items-center">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
              {course.instructorName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="text-muted-foreground">{course.instructorName}</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {course.level}
          </Badge>
        </div>
        
        {course.nextSession && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <div className="text-primary">
              {t('home.courses.liveIn', { hours: Math.ceil((course.nextSession.startTime.getTime() - Date.now()) / (1000 * 60 * 60)) })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1599081595468-de614fc93694?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlZHVjYXRpb24lMjB0ZWNobm9sb2d5JTIwZ3JhZGllbnR8ZW58MXx8fHwxNzU4ODUzMTYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Modern education technology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-indigo-900/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">{t('home.hero.badge')}</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl mb-8 leading-tight">
            <span className="block">{t('home:hero.title')}</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold">
              {t('home:hero.titleHighlight')}
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {t('home:hero.subtitle')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {user ? (
              <Button 
                size="lg" 
                onClick={() => onNavigate('/catalog')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {t('navigation.catalog')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => onNavigate('/auth/signup')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('home.hero.startFree')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => onNavigate('/catalog')}
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('home.hero.watchDemo')}
                </Button>
              </>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-blue-400 mb-2"><h2>50K+</h2></div>
              <div className="text-gray-300">{t('home.hero.stats.students')}</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 mb-2"><h2>1.2K+</h2></div>
              <div className="text-gray-300">{t('home.hero.stats.courses')}</div>
            </div>
            <div className="text-center">
              <div className="text-indigo-400 mb-2"><h2>500+</h2></div>
              <div className="text-gray-300">{t('home.hero.stats.instructors')}</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-400 mb-2"><h2>4.9</h2></div>
              <div className="text-gray-300">{t('home.hero.stats.rating')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              <span>{t('home.features.badge')}</span>
            </div>
            <h2 className="mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {t('home.features.title')}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.liveInteractive.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.liveInteractive.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.aiPersonalized.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.aiPersonalized.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.certifications.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.certifications.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.support.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.support.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-teal-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.multiPlatform.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.multiPlatform.description')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Infinity className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                </div>
                <CardTitle>{t('home.features.unlimitedAccess.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {t('home.features.unlimitedAccess.description')}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Trust Section */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl mb-6">{t('home.features.trust.title')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span>{t('home.features.trust.secured')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>{t('home.features.trust.gdpr')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-purple-500" />
                    <span>{t('home.features.trust.iso')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span>{t('home.features.trust.uptime')}</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMGxlYXJuaW5nfGVufDF8fHx8MTc1ODgyNTU5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Team collaboration"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
              <Star className="w-4 h-4 mr-2" />
              <span>{t('home.courses.badge')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {t('home.courses.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('home.courses.subtitle')}
            </p>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('/catalog')}
              className="group hover:shadow-lg transition-all duration-300"
            >
              {t('home.courses.viewAll')}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full"></div>
          <div className="absolute top-32 right-20 w-3 h-3 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white/25 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-4 h-4 bg-white/15 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => onNavigate('/auth/signup')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('home.cta.startFree')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onNavigate('/contact')}
                className="border-white/50 text-white hover:bg-white/20 hover:border-white/70 px-8 py-4 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 font-semibold shadow-lg"
              >
                {t('home.cta.talkExpert')}
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">{t('home.cta.trial')}</div>
                <div className="text-blue-100">{t('home.cta.trialSub')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{t('home.cta.noCommitment')}</div>
                <div className="text-blue-100">{t('home.cta.noCommitmentSub')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{t('home.cta.supportIncluded')}</div>
                <div className="text-blue-100">{t('home.cta.supportIncludedSub')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
