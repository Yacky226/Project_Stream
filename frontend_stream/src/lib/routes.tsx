import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Bell } from 'lucide-react';

// Lazy load all page components for better performance
const HomePage = lazy(() => import('../components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AuthPageRedux = lazy(() => import('../components/pages/AuthPageRedux').then(m => ({ default: m.AuthPageRedux })));
const ResetPasswordPage = lazy(() => import('../components/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const CourseCatalog = lazy(() => import('../components/pages/CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const CourseDetail = lazy(() => import('../components/pages/CourseDetail').then(m => ({ default: m.CourseDetail })));
const StudentDashboard = lazy(() => import('../components/pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const StudentCoursesPage = lazy(() => import('../components/pages/StudentCoursesPage').then(m => ({ default: m.StudentCoursesPage })));
const StudentLearningPathPage = lazy(() => import('../components/pages/StudentLearningPathPage').then(m => ({ default: m.StudentLearningPathPage })));
const StudentLiveSessionsPage = lazy(() => import('../components/pages/StudentLiveSessionsPage').then(m => ({ default: m.StudentLiveSessionsPage })));
const StudentAchievementsPage = lazy(() => import('../components/pages/StudentAchievementsPage').then(m => ({ default: m.StudentAchievementsPage })));
const StudentCommunityPage = lazy(() => import('../components/pages/StudentCommunityPage').then(m => ({ default: m.StudentCommunityPage })));
const TeacherDashboard = lazy(() => import('../components/pages/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const AdminDashboard = lazy(() => import('../components/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProfilePage = lazy(() => import('../components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('../components/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SearchPage = lazy(() => import('../components/pages/SearchPage').then(m => ({ default: m.SearchPage })));
const LiveSession = lazy(() => import('../components/pages/LiveSession').then(m => ({ default: m.LiveSession })));
const TeacherProfile = lazy(() => import('../components/pages/TeacherProfile').then(m => ({ default: m.TeacherProfile })));
const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Live streaming components
const SimpleLiveStudio = lazy(() => import('../components/live/SimpleLiveComponents').then(m => ({ default: m.SimpleLiveStudio })));
const SimpleLiveViewer = lazy(() => import('../components/live/SimpleLiveComponents').then(m => ({ default: m.SimpleLiveViewer })));
const SimpleLiveManager = lazy(() => import('../components/live/SimpleLiveComponents').then(m => ({ default: m.SimpleLiveManager })));

// Static pages
const ContactPage = lazy(() => import('../components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('../components/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const TermsPage = lazy(() => import('../components/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('../components/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const HelpPage = lazy(() => import('../components/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const BusinessPage = lazy(() => import('../components/pages/BusinessPage').then(m => ({ default: m.BusinessPage })));
const AccessibilityPage = lazy(() => import('../components/pages/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const BlogPage = lazy(() => import('../components/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const MobileAppPage = lazy(() => import('../components/pages/MobileAppPage').then(m => ({ default: m.MobileAppPage })));
const CareersPage = lazy(() => import('../components/pages/CareersPage').then(m => ({ default: m.CareersPage })));
const CategoryGeneralPage = lazy(() => import('../components/pages/CategoryGeneralPage').then(m => ({ default: m.CategoryGeneralPage })));
const LiveSessionsPage = lazy(() => import('../components/pages/LiveSessionsPage').then(m => ({ default: m.LiveSessionsPage })));
const CourseBuilderPage = lazy(() => import('../components/pages/CourseBuilderPage').then(m => ({ default: m.CourseBuilderPage })));
const LiveSessionBuilderPage = lazy(() => import('../components/pages/LiveSessionBuilderPage').then(m => ({ default: m.LiveSessionBuilderPage })));

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  requireAuth?: boolean;
  allowedRoles?: string[];
  title?: string;
  description?: string;
}

interface DynamicRouteConfig {
  pattern: RegExp;
  component: React.ComponentType<any>;
  getProps?: (match: RegExpMatchArray) => Record<string, unknown>;
  requireAuth?: boolean;
  allowedRoles?: string[];
  title?: string;
  description?: string;
}

export interface RouteAccessConfig {
  requireAuth?: boolean;
  allowedRoles?: string[];
  title?: string;
  description?: string;
}

interface MatchedRoute {
  component: React.ComponentType<any>;
  props: Record<string, unknown>;
  config: RouteAccessConfig;
}

// Loading component wrapper
function withSuspense(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Route definitions
export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    component: withSuspense(HomePage),
    exact: true,
    title: 'Accueil - Stream Ã‰ducatif',
    description: 'Plateforme de streaming Ã©ducatif en direct'
  },
  {
    path: '/catalog',
    component: withSuspense(CourseCatalog),
    title: 'Catalogue des cours',
    description: 'DÃ©couvrez tous nos cours disponibles'
  },
  {
    path: '/search',
    component: withSuspense(SearchPage),
    title: 'Recherche',
    description: 'Recherchez des cours et des enseignants'
  },
  
  // Auth routes
  {
    path: '/auth/signin',
    component: withSuspense((props: any) => <AuthPageRedux mode="signin" {...props} />),
    title: 'Connexion',
    description: 'Connectez-vous Ã  votre compte'
  },
  {
    path: '/auth/signup',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" {...props} />),
    title: 'Inscription',
    description: 'CrÃ©ez votre compte Ã©tudiant ou enseignant'
  },
  {
    path: '/auth/signup/student',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="student" {...props} />),
    title: 'Inscription Ã©tudiant',
    description: 'CrÃ©ez votre compte Ã©tudiant'
  },
  {
    path: '/auth/signup/teacher',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="teacher" {...props} />),
    title: 'Inscription enseignant',
    description: 'CrÃ©ez votre compte enseignant'
  },
  {
    path: '/auth/forgot',
    component: withSuspense((props: any) => <AuthPageRedux mode="forgot" {...props} />),
    title: 'Mot de passe oubliÃ©',
    description: 'RÃ©initialisez votre mot de passe'
  },
  
  {
    path: '/reset-password',
    component: withSuspense(ResetPasswordPage),
    title: 'Nouveau mot de passe',
    description: 'Definir un nouveau mot de passe'
  },
  
  // Dashboard routes
  {
    path: '/dashboard',
    component: withSuspense(StudentDashboard),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Tableau de bord Ã©tudiant',
    description: 'GÃ©rez vos cours et votre progression'
  },
  {
    path: '/student/courses',
    component: withSuspense(StudentCoursesPage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Student Courses',
    description: 'Suivi detaille des cours et inscriptions etudiant'
  },
  {
    path: '/student/learning-path',
    component: withSuspense(StudentLearningPathPage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Student Learning Path',
    description: 'Parcours d apprentissage personalise'
  },
  {
    path: '/student/live',
    component: withSuspense(StudentLiveSessionsPage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Student Live Sessions',
    description: 'Sessions live etudiant'
  },
  {
    path: '/student/achievements',
    component: withSuspense(StudentAchievementsPage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Student Achievements',
    description: 'Recompenses, badges et classement etudiant'
  },
  {
    path: '/student/community',
    component: withSuspense(StudentCommunityPage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Student Community',
    description: 'Communaute et contenu editorial etudiant'
  },
  {
    path: '/teacher/dashboard',
    component: withSuspense(TeacherDashboard),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Tableau de bord enseignant',
    description: 'GÃ©rez vos cours et vos Ã©tudiants'
  },
  {
    path: '/admin',
    component: withSuspense(AdminDashboard),
    requireAuth: true,
    allowedRoles: ['admin'],
    title: 'Administration',
    description: 'Panneau d\'administration'
  },
  
  // Profile routes
  {
    path: '/profile',
    component: withSuspense(ProfilePage),
    requireAuth: true,
    title: 'Mon profil',
    description: 'GÃ©rez votre profil utilisateur'
  },
  {
    path: '/settings',
    component: withSuspense(SettingsPage),
    requireAuth: true,
    title: 'ParamÃ¨tres',
    description: 'Configurez vos prÃ©fÃ©rences'
  },
  {
    path: '/notifications',
    component: withSuspense((props: any) => (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Notifications</h1>
          <p className="text-muted-foreground">GÃ©rez vos notifications</p>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Votre centre de notifications sera bientÃ´t disponible.</p>
        </div>
      </div>
    )),
    requireAuth: true,
    title: 'Notifications',
    description: 'Vos notifications'
  },
  
  // Teacher routes
  {
    path: '/teacher/signup',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="teacher" {...props} />),
    title: 'Devenir enseignant',
    description: 'CrÃ©ez votre compte enseignant'
  },
  {
    path: '/teacher/live-sessions',
    component: withSuspense((props: any) => (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Cours et Sessions Live</h1>
          <p className="text-muted-foreground">Creer vos cours puis programmer plusieurs sessions live par cours</p>
        </div>
        <SimpleLiveManager courseId="all" {...props} />
      </div>
    )),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Cours et Sessions Live',
    description: 'Creez les cours et gerez plusieurs sessions live'
  },
  {
    path: '/teacher/course-builder',
    component: withSuspense(CourseBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher', 'admin'],
    title: 'Course Builder',
    description: 'Creation d un cours en plusieurs etapes'
  },
  {
    path: '/teacher/course-builder/curriculum',
    component: withSuspense(CourseBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher', 'admin'],
    title: 'Course Builder - Curriculum',
    description: 'Construction du curriculum de cours'
  },
  {
    path: '/teacher/course-builder/settings',
    component: withSuspense(CourseBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher', 'admin'],
    title: 'Course Builder - Settings',
    description: 'Parametres et pricing du cours'
  },
  {
    path: '/teacher/course-builder/publish',
    component: withSuspense(CourseBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher', 'admin'],
    title: 'Course Builder - Publish',
    description: 'Revision et publication du cours'
  },
  {
    path: '/teacher/live-session-builder',
    component: withSuspense(LiveSessionBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Live Session Builder - Basic Info',
    description: 'Creation de session live - informations de base'
  },
  {
    path: '/teacher/live-session-builder/technical',
    component: withSuspense(LiveSessionBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Live Session Builder - Technical Setup',
    description: 'Creation de session live - configuration technique'
  },
  {
    path: '/teacher/live-session-builder/audience',
    component: withSuspense(LiveSessionBuilderPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Live Session Builder - Audience & Pricing',
    description: 'Creation de session live - audience et pricing'
  },
  
  // Live streaming routes
  {
    path: '/live-sessions',
    component: withSuspense(LiveSessionsPage),
    title: 'Sessions en direct',
    description: 'Sessions de cours en direct'
  },
  
  // Course category routes
  {
    path: '/courses/categories',
    component: withSuspense(CategoryGeneralPage),
    title: 'Categories',
    description: 'Vue generale des categories techniques'
  },
  {
    path: '/courses/programming',
    component: withSuspense(CategoryGeneralPage),
    title: 'Cours de programmation',
    description: 'Apprenez la programmation'
  },
  {
    path: '/courses/design',
    component: withSuspense(CategoryGeneralPage),
    title: 'Cours de design',
    description: 'Apprenez le design'
  },
  {
    path: '/courses/marketing',
    component: withSuspense(CategoryGeneralPage),
    title: 'Cours de marketing',
    description: 'Apprenez le marketing'
  },
  {
    path: '/courses/beginner',
    component: withSuspense(CategoryGeneralPage),
    title: 'Cours pour dÃ©butants',
    description: 'Courses parfaits pour commencer'
  },
  
  // Static pages
  {
    path: '/contact',
    component: withSuspense(ContactPage),
    title: 'Contact',
    description: 'Contactez notre Ã©quipe'
  },
  {
    path: '/faq',
    component: withSuspense(FAQPage),
    title: 'Questions frÃ©quentes',
    description: 'Trouvez des rÃ©ponses Ã  vos questions'
  },
  {
    path: '/terms',
    component: withSuspense(TermsPage),
    title: 'Conditions d\'utilisation',
    description: 'Nos conditions d\'utilisation'
  },
  {
    path: '/privacy',
    component: withSuspense(PrivacyPage),
    title: 'Politique de confidentialitÃ©',
    description: 'Notre politique de confidentialitÃ©'
  },
  {
    path: '/help',
    component: withSuspense(HelpPage),
    title: 'Centre d\'aide',
    description: 'Centre d\'aide et documentation'
  },
  {
    path: '/business',
    component: withSuspense(BusinessPage),
    title: 'Solutions entreprise',
    description: 'Solutions pour les entreprises'
  },
  {
    path: '/accessibility',
    component: withSuspense(AccessibilityPage),
    title: 'AccessibilitÃ©',
    description: 'Notre engagement pour l\'accessibilitÃ©'
  },
  {
    path: '/blog',
    component: withSuspense(BlogPage),
    title: 'Blog',
    description: 'Articles et actualitÃ©s'
  },
  {
    path: '/mobile-app',
    component: withSuspense(MobileAppPage),
    title: 'Application mobile',
    description: 'TÃ©lÃ©chargez notre application'
  },
  {
    path: '/careers',
    component: withSuspense(CareersPage),
    title: 'CarriÃ¨res',
    description: 'Rejoignez notre Ã©quipe'
  },
  
];

// Dynamic route patterns
export const dynamicRoutes: DynamicRouteConfig[] = [
  {
    pattern: /^\/courses\/([^\/]+)$/,
    component: withSuspense(CourseDetail),
    getProps: (match: RegExpMatchArray) => ({ courseId: match[1] }),
    title: 'DÃ©tail du cours',
    description: 'Informations dÃ©taillÃ©es sur le cours'
  },
  {
    pattern: /^\/courses\/([^\/]+)\/session\/([^\/]+)$/,
    component: withSuspense(LiveSession),
    getProps: (match: RegExpMatchArray) => ({ 
      courseId: match[1], 
      sessionId: match[2] 
    }),
    requireAuth: true,
    title: 'Session live',
    description: 'Session de cours en direct'
  },
  {
    pattern: /^\/teacher\/live\/([^\/]+)(?:\/([^\/]+))?$/,
    component: withSuspense(SimpleLiveStudio),
    getProps: (match: RegExpMatchArray) => ({ 
      courseId: match[1], 
      sessionId: match[2]
    }),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Studio live',
    description: 'Interface de streaming pour enseignants'
  },
  {
    pattern: /^\/courses\/([^\/]+)\/live(?:\/([^\/]+))?$/,
    component: withSuspense(SimpleLiveViewer),
    getProps: (match: RegExpMatchArray) => ({ 
      courseId: match[1], 
      sessionId: match[2] || 'current'
    }),
    title: 'Session live',
    description: 'Visionnage de session en direct'
  },
  {
    pattern: /^\/profile\/teacher\/([^\/]+)$/,
    component: withSuspense(TeacherProfile),
    getProps: (match: RegExpMatchArray) => ({ teacherId: match[1] }),
    title: 'Profil enseignant',
    description: 'Profil public d\'un enseignant'
  }
];

// Route matcher utility
export function matchRoute(path: string): MatchedRoute {
  // Check static routes first
  const staticRoute = routes.find(route => route.path === path);
  if (staticRoute) {
    return {
      component: staticRoute.component,
      props: {},
      config: {
        requireAuth: staticRoute.requireAuth,
        allowedRoles: staticRoute.allowedRoles,
        title: staticRoute.title,
        description: staticRoute.description,
      },
    };
  }
  
  // Check dynamic routes
  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) {
      return {
        component: route.component,
        props: route.getProps ? route.getProps(match) : {},
        config: {
          requireAuth: route.requireAuth,
          allowedRoles: route.allowedRoles,
          title: route.title,
          description: route.description,
        },
      };
    }
  }
  
  // Return 404 if no match
  return {
    component: withSuspense(NotFoundPage),
    props: {},
    config: {
      requireAuth: false,
      allowedRoles: undefined,
      title: 'Page non trouvÃ©e',
      description: 'La page demandÃ©e n\'existe pas'
    }
  };
}

// Utility to check if user can access route
export function canAccessRoute(
  route: RouteAccessConfig, 
  isAuthenticated: boolean, 
  userRole?: string
): boolean {
  if (route.requireAuth && !isAuthenticated) {
    return false;
  }
  
  if (route.allowedRoles && userRole && !route.allowedRoles.includes(userRole)) {
    return false;
  }
  
  return true;
}

// SEO utility
export function getRouteMeta(path: string) {
  const routeMatch = matchRoute(path);
  return {
    title: routeMatch.config.title || 'Stream Ã‰ducatif',
    description: routeMatch.config.description || 'Plateforme de streaming Ã©ducatif'
  };
}

