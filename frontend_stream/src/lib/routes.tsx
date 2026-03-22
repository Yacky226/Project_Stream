import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { normalizeUserRole } from './roleUtils';

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
const TeacherCoursesPage = lazy(() => import('../components/pages/TeacherCoursesPage').then(m => ({ default: m.TeacherCoursesPage })));
const TeacherStudentsPage = lazy(() => import('../components/pages/TeacherStudentsPage').then(m => ({ default: m.TeacherStudentsPage })));
const TeacherLiveSessionsPage = lazy(() => import('../components/pages/TeacherLiveSessionsPage').then(m => ({ default: m.TeacherLiveSessionsPage })));
const AdminDashboard = lazy(() => import('../components/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminUsersPage = lazy(() => import('../components/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminCoursesPage = lazy(() => import('../components/pages/AdminCoursesPage').then(m => ({ default: m.AdminCoursesPage })));
const AdminSupportPage = lazy(() => import('../components/pages/AdminSupportPage').then(m => ({ default: m.AdminSupportPage })));
const ProfilePage = lazy(() => import('../components/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PublicStudentProfilePage = lazy(() => import('../components/pages/PublicStudentProfilePage').then(m => ({ default: m.PublicStudentProfilePage })));
const SettingsPage = lazy(() => import('../components/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('../components/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SearchPage = lazy(() => import('../components/pages/SearchPage').then(m => ({ default: m.SearchPage })));
const TeacherProfile = lazy(() => import('../components/pages/TeacherProfile').then(m => ({ default: m.TeacherProfile })));
const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Live streaming components
const SimpleLiveStudio = lazy(() => import('../components/live/SimpleLiveComponents').then(m => ({ default: m.SimpleLiveStudio })));
const SimpleLiveViewer = lazy(() => import('../components/live/SimpleLiveComponents').then(m => ({ default: m.SimpleLiveViewer })));

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
    title: 'Accueil - Stream Educatif',
    description: 'Plateforme de streaming educatif en direct'
  },
  {
    path: '/catalog',
    component: withSuspense(CourseCatalog),
    title: 'Catalogue des cours',
    description: 'Decouvrez tous nos cours disponibles'
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
    description: 'Connectez-vous a votre compte'
  },
  {
    path: '/auth/signup',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" {...props} />),
    title: 'Inscription',
    description: 'Creez votre compte etudiant ou enseignant'
  },
  {
    path: '/auth/signup/student',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="student" {...props} />),
    title: 'Inscription etudiant',
    description: 'Creez votre compte etudiant'
  },
  {
    path: '/auth/signup/teacher',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="teacher" {...props} />),
    title: 'Inscription enseignant',
    description: 'Creez votre compte enseignant'
  },
  {
    path: '/auth/forgot',
    component: withSuspense((props: any) => <AuthPageRedux mode="forgot" {...props} />),
    title: 'Mot de passe oublie',
    description: 'Reinitialisez votre mot de passe'
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
    title: 'Tableau de bord etudiant',
    description: 'Gerez vos cours et votre progression'
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
    description: 'Gerez vos cours et vos etudiants'
  },
  {
    path: '/admin',
    component: withSuspense(AdminDashboard),
    requireAuth: true,
    allowedRoles: ['admin'],
    title: 'Administration',
    description: 'Panneau d\'administration'
  },
  {
    path: '/admin/users',
    component: withSuspense(AdminUsersPage),
    requireAuth: true,
    allowedRoles: ['admin'],
    title: 'Administration utilisateurs',
    description: 'Gestion detaillee des utilisateurs'
  },
  {
    path: '/admin/courses',
    component: withSuspense(AdminCoursesPage),
    requireAuth: true,
    allowedRoles: ['admin'],
    title: 'Administration cours',
    description: 'Gestion detaillee des cours'
  },
  {
    path: '/admin/support',
    component: withSuspense(AdminSupportPage),
    requireAuth: true,
    allowedRoles: ['admin'],
    title: 'Administration support',
    description: 'Centre de support et operations'
  },
  
  // Profile routes
  {
    path: '/profile',
    component: withSuspense(ProfilePage),
    requireAuth: true,
    title: 'Mon profil',
    description: 'Gerez votre profil utilisateur'
  },
  {
    path: '/profile/public',
    component: withSuspense(PublicStudentProfilePage),
    requireAuth: true,
    allowedRoles: ['student'],
    title: 'Profil public etudiant',
    description: 'Previsualisez votre profil public etudiant'
  },
  {
    path: '/settings',
    component: withSuspense(SettingsPage),
    requireAuth: true,
    title: 'Parametres',
    description: 'Configurez vos preferences'
  },
  {
    path: '/notifications',
    component: withSuspense(NotificationsPage),
    requireAuth: true,
    title: 'Notifications',
    description: 'Vos notifications'
  },
  
  // Teacher routes
  {
    path: '/teacher/signup',
    component: withSuspense((props: any) => <AuthPageRedux mode="signup" defaultSignupRole="teacher" {...props} />),
    title: 'Devenir enseignant',
    description: 'Creez votre compte enseignant'
  },
  {
    path: '/teacher/live-sessions',
    component: withSuspense(TeacherLiveSessionsPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Cours et Sessions Live',
    description: 'Creez les cours et gerez plusieurs sessions live'
  },
  {
    path: '/teacher/my-courses',
    component: withSuspense(TeacherCoursesPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'My Courses',
    description: 'Liste des cours crees par l enseignant'
  },
  {
    path: '/teacher/students',
    component: withSuspense(TeacherStudentsPage),
    requireAuth: true,
    allowedRoles: ['teacher'],
    title: 'Teacher Students',
    description: 'Liste des etudiants inscrits aux cours enseignant'
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
    title: 'Cours pour debutants',
    description: 'Courses parfaits pour commencer'
  },
  
  // Static pages
  {
    path: '/contact',
    component: withSuspense(ContactPage),
    title: 'Contact',
    description: 'Contactez notre equipe'
  },
  {
    path: '/faq',
    component: withSuspense(FAQPage),
    title: 'Questions frequentes',
    description: 'Trouvez des reponses a vos questions'
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
    title: 'Politique de confidentialite',
    description: 'Notre politique de confidentialite'
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
    title: 'Accessibilite',
    description: 'Notre engagement pour l\'accessibilite'
  },
  {
    path: '/blog',
    component: withSuspense(BlogPage),
    title: 'Blog',
    description: 'Articles et actualites'
  },
  {
    path: '/mobile-app',
    component: withSuspense(MobileAppPage),
    title: 'Application mobile',
    description: 'Telechargez notre application'
  },
  {
    path: '/careers',
    component: withSuspense(CareersPage),
    title: 'Carrieres',
    description: 'Rejoignez notre equipe'
  },
  
];

// Dynamic route patterns
export const dynamicRoutes: DynamicRouteConfig[] = [
  {
    pattern: /^\/courses\/([^\/]+)$/,
    component: withSuspense(CourseDetail),
    getProps: (match: RegExpMatchArray) => ({ courseId: match[1] }),
    title: 'Detail du cours',
    description: 'Informations detaillees sur le cours'
  },
  {
    pattern: /^\/courses\/([^\/]+)\/session\/([^\/]+)$/,
    component: withSuspense(SimpleLiveViewer),
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
      title: 'Page non trouvee',
      description: 'La page demandee n\'existe pas'
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
  
  if (route.allowedRoles) {
    if (!userRole) {
      return false;
    }

    const normalizedRole = normalizeUserRole(userRole);
    const normalizedAllowedRoles = route.allowedRoles.map((role) => normalizeUserRole(role));
    if (!normalizedAllowedRoles.includes(normalizedRole)) {
      return false;
    }
  }
  
  return true;
}

// SEO utility
export function getRouteMeta(path: string) {
  const routeMatch = matchRoute(path);
  return {
    title: routeMatch.config.title || 'Stream Educatif',
    description: routeMatch.config.description || 'Plateforme de streaming educatif'
  };
}

