import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Bell } from 'lucide-react';

// Lazy load all page components for better performance
const HomePage = lazy(() => import('../components/pages/HomePage').then(m => ({ default: m.HomePage })));
const AuthPageRedux = lazy(() => import('../components/pages/AuthPageRedux').then(m => ({ default: m.AuthPageRedux })));
const CourseCatalog = lazy(() => import('../components/pages/CourseCatalog').then(m => ({ default: m.CourseCatalog })));
const CourseDetail = lazy(() => import('../components/pages/CourseDetail').then(m => ({ default: m.CourseDetail })));
const StudentDashboard = lazy(() => import('../components/pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
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
const AdvancedLiveSession = lazy(() => import('../components/live/AdvancedLiveSession').then(m => ({ default: m.AdvancedLiveSession })));

// Static pages
const ContactPage = lazy(() => import('../components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('../components/pages/FAQPage').then(m => ({ default: m.FAQPage })));
const TermsPage = lazy(() => import('../components/pages/TermsPage').then(m => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('../components/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const HelpPage = lazy(() => import('../components/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const BusinessPage = lazy(() => import('../components/pages/BusinessPage').then(m => ({ default: m.BusinessPage })));
const AccessibilityPage = lazy(() => import('../components/pages/AccessibilityPage').then(m => ({ default: m.AccessibilityPage })));
const TeacherSignupPage = lazy(() => import('../components/pages/TeacherSignupPage').then(m => ({ default: m.TeacherSignupPage })));
const BlogPage = lazy(() => import('../components/pages/BlogPage').then(m => ({ default: m.BlogPage })));
const LiveStreamingDemoPage = lazy(() => import('../components/pages/LiveStreamingDemoPage').then(m => ({ default: m.LiveStreamingDemoPage })));
const MobileAppPage = lazy(() => import('../components/pages/MobileAppPage').then(m => ({ default: m.MobileAppPage })));
const CareersPage = lazy(() => import('../components/pages/CareersPage').then(m => ({ default: m.CareersPage })));
const ProgrammingCoursesPage = lazy(() => import('../components/pages/ProgrammingCoursesPage').then(m => ({ default: m.ProgrammingCoursesPage })));
const DesignCoursesPage = lazy(() => import('../components/pages/DesignCoursesPage').then(m => ({ default: m.DesignCoursesPage })));
const MarketingCoursesPage = lazy(() => import('../components/pages/MarketingCoursesPage').then(m => ({ default: m.MarketingCoursesPage })));
const BeginnerCoursesPage = lazy(() => import('../components/pages/BeginnerCoursesPage').then(m => ({ default: m.BeginnerCoursesPage })));
const LiveSessionsPage = lazy(() => import('../components/pages/LiveSessionsPage').then(m => ({ default: m.LiveSessionsPage })));

// Debug components
const ReduxDemo = lazy(() => import('../components/demo/ReduxDemo').then(m => ({ default: m.ReduxDemo })));
const StreamingDebugPanel = lazy(() => import('../components/live/StreamingServiceProvider').then(m => ({ default: m.StreamingDebugPanel })));

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
    title: 'Accueil - Stream Éducatif',
    description: 'Plateforme de streaming éducatif en direct'
  },
  {
    path: '/catalog',
    component: withSuspense(CourseCatalog),
    title: 'Catalogue des cours',
    description: 'Découvrez tous nos cours disponibles'
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
    description: 'Connectez-vous à votre compte'
  },
  {
    path: '/auth/signup',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" {...props} />),
    title: 'Inscription',
    description: 'Créez votre compte'
  },
  {
    path: '/auth/forgot',
    component: withSuspense((props: any) => <AuthPageRedux mode="forgot" {...props} />),
    title: 'Mot de passe oublié',
    description: 'Réinitialisez votre mot de passe'
  },
  
  // Dashboard routes
  {
    path: '/dashboard',
    component: withSuspense(StudentDashboard),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Tableau de bord étudiant',
    description: 'Gérez vos cours et votre progression'
  },
  {
    path: '/teacher/dashboard',
    component: withSuspense(TeacherDashboard),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Tableau de bord enseignant',
    description: 'Gérez vos cours et vos étudiants'
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
    description: 'Gérez votre profil utilisateur'
  },
  {
    path: '/settings',
    component: withSuspense(SettingsPage),
    requireAuth: true,
    title: 'Paramètres',
    description: 'Configurez vos préférences'
  },
  {
    path: '/notifications',
    component: withSuspense((props: any) => (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Notifications</h1>
          <p className="text-muted-foreground">Gérez vos notifications</p>
        </div>
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Votre centre de notifications sera bientôt disponible.</p>
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
    component: withSuspense(TeacherSignupPage),
    title: 'Devenir enseignant',
    description: 'Rejoignez notre équipe d\'enseignants'
  },
  {
    path: '/teacher/live-sessions',
    component: withSuspense((props: any) => (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Gestion des Sessions Live</h1>
          <p className="text-muted-foreground">Créez et gérez vos sessions de streaming</p>
        </div>
        <SimpleLiveManager courseId="all" {...props} />
      </div>
    )),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Gestion des sessions live',
    description: 'Gérez vos sessions de streaming'
  },
  
  // Live streaming routes
  {
    path: '/live-sessions',
    component: withSuspense(LiveSessionsPage),
    title: 'Sessions en direct',
    description: 'Sessions de cours en direct'
  },
  {
    path: '/demo/streaming',
    component: withSuspense(LiveStreamingDemoPage),
    title: 'Démo streaming',
    description: 'Démonstration du système de streaming'
  },
  
  // Course category routes
  {
    path: '/courses/programming',
    component: withSuspense(ProgrammingCoursesPage),
    title: 'Cours de programmation',
    description: 'Apprenez la programmation'
  },
  {
    path: '/courses/design',
    component: withSuspense(DesignCoursesPage),
    title: 'Cours de design',
    description: 'Apprenez le design'
  },
  {
    path: '/courses/marketing',
    component: withSuspense(MarketingCoursesPage),
    title: 'Cours de marketing',
    description: 'Apprenez le marketing'
  },
  {
    path: '/courses/beginner',
    component: withSuspense(BeginnerCoursesPage),
    title: 'Cours pour débutants',
    description: 'Courses parfaits pour commencer'
  },
  
  // Static pages
  {
    path: '/contact',
    component: withSuspense(ContactPage),
    title: 'Contact',
    description: 'Contactez notre équipe'
  },
  {
    path: '/faq',
    component: withSuspense(FAQPage),
    title: 'Questions fréquentes',
    description: 'Trouvez des réponses à vos questions'
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
    title: 'Politique de confidentialité',
    description: 'Notre politique de confidentialité'
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
    title: 'Accessibilité',
    description: 'Notre engagement pour l\'accessibilité'
  },
  {
    path: '/blog',
    component: withSuspense(BlogPage),
    title: 'Blog',
    description: 'Articles et actualités'
  },
  {
    path: '/mobile-app',
    component: withSuspense(MobileAppPage),
    title: 'Application mobile',
    description: 'Téléchargez notre application'
  },
  {
    path: '/careers',
    component: withSuspense(CareersPage),
    title: 'Carrières',
    description: 'Rejoignez notre équipe'
  },
  
  // Debug routes (development only)
  {
    path: '/debug/redux',
    component: withSuspense(ReduxDemo),
    title: 'Debug Redux',
    description: 'Interface de debug Redux'
  },
  {
    path: '/debug/streaming',
    component: withSuspense((props: any) => (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Debug Streaming Services</h1>
          <p className="text-muted-foreground">Diagnostics et état des connexions</p>
        </div>
        <StreamingDebugPanel />
      </div>
    )),
    title: 'Debug Streaming',
    description: 'Diagnostics du système de streaming'
  }
];

// Dynamic route patterns
export const dynamicRoutes = [
  {
    pattern: /^\/courses\/([^\/]+)$/,
    component: withSuspense(CourseDetail),
    getProps: (match: RegExpMatchArray) => ({ courseId: match[1] }),
    title: 'Détail du cours',
    description: 'Informations détaillées sur le cours'
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
    pattern: /^\/teacher\/live\/advanced\/([^\/]+)(?:\/([^\/]+))?$/,
    component: withSuspense(AdvancedLiveSession),
    getProps: (match: RegExpMatchArray) => ({ 
      courseId: match[1], 
      sessionId: match[2],
      userRole: 'teacher'
    }),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Studio live avancé',
    description: 'Interface avancée de streaming pour enseignants'
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
    pattern: /^\/courses\/([^\/]+)\/live\/advanced(?:\/([^\/]+))?$/,
    component: withSuspense(AdvancedLiveSession),
    getProps: (match: RegExpMatchArray) => ({ 
      courseId: match[1], 
      sessionId: match[2] || 'current',
      userRole: 'student'
    }),
    title: 'Session live avancée',
    description: 'Interface avancée de visionnage pour étudiants'
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
export function matchRoute(path: string) {
  // Check static routes first
  const staticRoute = routes.find(route => route.path === path);
  if (staticRoute) {
    return {
      component: staticRoute.component,
      props: {},
      config: staticRoute
    };
  }
  
  // Check dynamic routes
  for (const route of dynamicRoutes) {
    const match = path.match(route.pattern);
    if (match) {
      return {
        component: route.component,
        props: route.getProps ? route.getProps(match) : {},
        config: route
      };
    }
  }
  
  // Return 404 if no match
  return {
    component: withSuspense(NotFoundPage),
    props: {},
    config: {
      title: 'Page non trouvée',
      description: 'La page demandée n\'existe pas'
    }
  };
}

// Utility to check if user can access route
export function canAccessRoute(
  route: RouteConfig | any, 
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
    title: routeMatch.config.title || 'Stream Éducatif',
    description: routeMatch.config.description || 'Plateforme de streaming éducatif'
  };
}