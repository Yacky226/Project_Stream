import { useEffect, useRef } from 'react';
import { HeaderRedux } from './components/layout/HeaderRedux';
import { Footer } from './components/layout/Footer';
import { Chatbot } from './components/chatbot/Chatbot';
import { ChatButton } from './components/chatbot/ChatButton';
import { useRouter } from './lib/router';
import { ErrorBoundary } from './lib/error-boundary';
import { ReduxProvider } from './components/providers/ReduxProvider';
import { I18nProvider } from './components/providers/I18nProvider';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { setCurrentPath, updateScreenInfo, setTheme } from './store/slices/uiSlice';
import { ReduxDebug } from './components/debug/ReduxDebug';
import { matchRoute, canAccessRoute, getRouteMeta } from './lib/routes';
import { configUtils } from './lib/config';
import { LoadingSpinner } from './components/ui/loading-spinner';

function AppContent() {
  const { currentPath, navigate } = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector(state => state.ui);
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const hasRedirected = useRef(false);
  const isAuthRoute = currentPath.startsWith('/auth');
  const isResetPasswordRoute = currentPath === '/reset-password';
  const isCourseDetailRoute = /^\/courses\/[^/]+$/.test(currentPath);
  const isLiveSessionRoute = /^\/courses\/[^/]+\/session\/[^/]+$/.test(currentPath);
  const isTeacherProfileRoute = /^\/profile\/teacher\/[^/]+$/.test(currentPath);
  const isProfileRoute = currentPath === '/profile';
  const isPublicStudentProfileRoute = currentPath === '/profile/public';
  const isSettingsRoute = currentPath === '/settings';
  const isNotificationsRoute = currentPath === '/notifications';
  const isCourseBuilderRoute =
    currentPath === '/teacher/course-builder' ||
    currentPath.startsWith('/teacher/course-builder/');
  const isLiveSessionBuilderRoute =
    currentPath === '/teacher/live-session-builder' ||
    currentPath.startsWith('/teacher/live-session-builder/');
  const isTeacherDashboardRoute = currentPath === '/teacher/dashboard';
  const isTeacherLiveSessionsRoute = currentPath === '/teacher/live-sessions';
  const isTeacherLiveStudioRoute = /^\/teacher\/live\/[^/]+(?:\/[^/]+)?$/.test(currentPath);
  const isAdminSpaceRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');
  const isStudentSpaceRoute =
    currentPath === '/dashboard' || currentPath.startsWith('/student/');
  const standalonePages = new Set([
    '/',
    '/catalog',
    '/search',
    '/courses/categories',
    '/courses/programming',
    '/courses/design',
    '/courses/marketing',
    '/courses/beginner',
    '/blog',
    '/mobile-app',
    '/privacy',
    '/help',
    '/contact',
    '/business',
    '/careers',
  ]);
  const currentRouteMeta = getRouteMeta(currentPath);
  const notFoundMeta = getRouteMeta('/404');
  const isNotFoundRoute =
    currentRouteMeta.title === notFoundMeta.title &&
    currentRouteMeta.description === notFoundMeta.description;
  const isFullscreenPage =
    standalonePages.has(currentPath) ||
    isAuthRoute ||
    isResetPasswordRoute ||
    isNotFoundRoute ||
    isCourseDetailRoute ||
    isLiveSessionRoute ||
    isTeacherProfileRoute ||
    isProfileRoute ||
    isPublicStudentProfileRoute ||
    isSettingsRoute ||
    isNotificationsRoute ||
    isCourseBuilderRoute ||
    isLiveSessionBuilderRoute ||
    isTeacherDashboardRoute ||
    isTeacherLiveSessionsRoute ||
    isTeacherLiveStudioRoute ||
    isAdminSpaceRoute ||
    isStudentSpaceRoute;

  // Initialize theme (only once on mount)
  useEffect(() => {
    try {
      // Set initial theme from localStorage
      const savedTheme = localStorage.getItem('ui_theme') as 'light' | 'dark' | 'system' || 'light';
      dispatch(setTheme(savedTheme));
      
      // Apply theme to document
      if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      configUtils.log('App initialized', { theme: savedTheme });
    } catch (error) {
      configUtils.error('Error setting initial app state:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update Redux when route changes
  useEffect(() => {
    dispatch(setCurrentPath(currentPath));
    hasRedirected.current = false; // Reset redirect flag on route change
    
    // Update page title based on route
    const routeMeta = getRouteMeta(currentPath);
    document.title = routeMeta.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', routeMeta.description);
    }
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    configUtils.debug('Route changed', { path: currentPath, meta: routeMeta });
  }, [currentPath, dispatch]);

  // Monitor screen size changes
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let screenSize: 'mobile' | 'tablet' | 'desktop';
      if (width < 768) {
        screenSize = 'mobile';
      } else if (width < 1024) {
        screenSize = 'tablet';
      } else {
        screenSize = 'desktop';
      }
      
      const orientation = width > height ? 'landscape' : 'portrait';
      
      dispatch(updateScreenInfo({ screenSize, orientation }));
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [dispatch]);

  // Handle theme changes
  useEffect(() => {
    const applyTheme = (theme: string) => {
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    
    applyTheme(theme);
    
    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme(theme);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const renderPage = () => {
    try {
      // Match route using the new route system
      const routeMatch = matchRoute(currentPath);
      const { component: PageComponent, props, config } = routeMatch;

      // Check authentication and authorization - handle redirects only once per route
      if (config.requireAuth && !isAuthenticated) {
        if (!currentPath.startsWith('/auth') && !hasRedirected.current) {
          hasRedirected.current = true;
          configUtils.warn('Access denied: Authentication required', { path: currentPath });
          setTimeout(() => {
            navigate(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
          }, 0);
        }
        return (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (!canAccessRoute(config, isAuthenticated, user?.role)) {
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          configUtils.warn('Access denied: Insufficient permissions', { 
            path: currentPath, 
            userRole: user?.role,
            requiredRoles: config.allowedRoles 
          });
          
          setTimeout(() => {
            if (isAuthenticated && user?.role) {
              const dashboardPaths: Record<string, string> = {
                admin: '/admin',
                teacher: '/teacher/dashboard',
                student: '/dashboard',
              };
              const redirectPath = dashboardPaths[user.role] || '/';
              if (currentPath !== redirectPath) {
                navigate(redirectPath);
              }
            } else if (!currentPath.startsWith('/auth')) {
              navigate('/auth/signin');
            }
          }, 0);
        }
        return (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      // Render the matched component with props
      return (
        <ErrorBoundary>
          <PageComponent 
            {...props} 
            onNavigate={navigate}
            currentPath={currentPath}
          />
        </ErrorBoundary>
      );
    } catch (error) {
      configUtils.error('Error rendering page:', error);
      // Fallback to NotFound page
      const { component: NotFoundComponent } = matchRoute('/404');
      return <NotFoundComponent onNavigate={navigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        {!isFullscreenPage && <HeaderRedux onNavigate={navigate} currentPath={currentPath} />}
        <main className="flex-1 overflow-x-hidden">
          {renderPage()}
        </main>
        {!isFullscreenPage && <Footer onNavigate={navigate} />}
        
        {/* Chatbot - Available for authenticated users */}
        {isAuthenticated && (
          <>
            <Chatbot onNavigate={navigate} currentPath={currentPath} />
            <ChatButton />
          </>
        )}
        
        {configUtils.isDevelopment() && import.meta.env.VITE_SHOW_REDUX_DEBUG === 'true' && (
          <ReduxDebug />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ReduxProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ReduxProvider>
  );
}
