import { useState, useEffect, ReactNode } from 'react';
import { useAuth, type UserRole } from './auth';

export interface Route {
  path: string;
  component: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  exact?: boolean;
}

export const useRouter = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      console.log('Initial path:', window.location.pathname);
      return window.location.pathname;
    }
    return '/';
  });
  const { getCurrentUser, hasRole } = useAuth();

  useEffect(() => {
    // Set initial path
    const initialPath = window.location.pathname;
    console.log('Setting initial path:', initialPath);
    setCurrentPath(initialPath);
    
    const handlePopState = () => {
      console.log('Pop state event, new path:', window.location.pathname);
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, replace = false) => {
    console.log('Navigating from', currentPath, 'to', path);
    
    // Dispatch custom event before navigation to allow components to cleanup
    window.dispatchEvent(new CustomEvent('beforeRouteChange', { 
      detail: { from: currentPath, to: path } 
    }));

    // Small delay to allow components to cleanup
    setTimeout(() => {
      if (replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
      console.log('Setting path to:', path);
      setCurrentPath(path);
    }, 10);
  };

  const matchRoute = (routePath: string, currentPath: string) => {
    // Convert route path to regex pattern
    const pattern = routePath
      .replace(/:\w+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\*/g, '.*'); // Replace * with wildcard
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(currentPath);
  };

  const extractParams = (routePath: string, currentPath: string): Record<string, string> => {
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');
    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        params[paramName] = pathParts[i];
      }
    }

    return params;
  };

  return {
    currentPath,
    navigate,
    matchRoute,
    extractParams
  };
};

export const ProtectedRoute = ({ 
  children, 
  requireAuth = false, 
  requiredRole 
}: { 
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
}) => {
  const { getCurrentUser, hasRole } = useAuth();
  const user = getCurrentUser();

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Accès restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const Router = ({ 
  routes, 
  notFoundComponent 
}: { 
  routes: Route[];
  notFoundComponent?: ReactNode;
}) => {
  const { currentPath, matchRoute, extractParams } = useRouter();

  for (const route of routes) {
    if (matchRoute(route.path, currentPath)) {
      const params = extractParams(route.path, currentPath);
      
      return (
        <ProtectedRoute 
          requireAuth={route.requireAuth}
          requiredRole={route.requiredRole}
        >
          {typeof route.component === 'function' 
            ? route.component(params) 
            : route.component
          }
        </ProtectedRoute>
      );
    }
  }

  // 404 Not Found
  return notFoundComponent || (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl mb-4">404</h1>
        <p className="text-muted-foreground">Page non trouvée</p>
      </div>
    </div>
  );
};