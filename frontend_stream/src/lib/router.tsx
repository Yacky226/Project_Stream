import { useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '../types/auth';
import { authStorage } from './localStorage';

export interface Route {
  path: string;
  component: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  exact?: boolean;
}

function getPathname(): string {
  if (typeof window === 'undefined') {
    return '/';
  }

  return window.location.pathname || '/';
}

function parseNavigationTarget(target: string): { historyPath: string; pathname: string } {
  const url = new URL(target, window.location.origin);
  return {
    historyPath: `${url.pathname}${url.search}${url.hash}`,
    pathname: url.pathname,
  };
}

export const useRouter = () => {
  const [currentPath, setCurrentPath] = useState(() => getPathname());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePopState = () => {
      setCurrentPath(getPathname());
    };

    setCurrentPath(getPathname());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string | number, replace = false) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof path === 'number') {
      window.history.go(path);
      return;
    }

    const { historyPath, pathname } = parseNavigationTarget(path);
    const currentHistoryPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    window.dispatchEvent(
      new CustomEvent('beforeRouteChange', {
        detail: { from: currentPath, to: pathname, fullPath: historyPath },
      }),
    );

    if (historyPath !== currentHistoryPath) {
      if (replace) {
        window.history.replaceState(null, '', historyPath);
      } else {
        window.history.pushState(null, '', historyPath);
      }
    }

    setCurrentPath(pathname);
  };

  const matchRoute = (routePath: string, activePath: string) => {
    const pattern = routePath.replace(/:\w+/g, '([^/]+)').replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(activePath);
  };

  const extractParams = (routePath: string, activePath: string): Record<string, string> => {
    const routeParts = routePath.split('/');
    const pathParts = activePath.split('/');
    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i += 1) {
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
    extractParams,
  };
};

export const ProtectedRoute = ({
  children,
  requireAuth = false,
  requiredRole,
}: {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole;
}) => {
  const savedAuth = authStorage.loadAuthData();
  const user = savedAuth?.user as { role?: UserRole } | null;

  const hasRequiredRole = (() => {
    if (!requiredRole) {
      return true;
    }

    const role = user?.role;
    if (!role) {
      return false;
    }

    const order: Record<UserRole, number> = {
      student: 0,
      teacher: 1,
      admin: 2,
    };

    return order[role] >= order[requiredRole];
  })();

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Acces restreint</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez etre connecte pour acceder a cette page.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Acces non autorise</h2>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas les permissions necessaires pour acceder a cette page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const Router = ({
  routes,
  notFoundComponent,
}: {
  routes: Route[];
  notFoundComponent?: ReactNode;
}) => {
  const { currentPath, matchRoute, extractParams } = useRouter();

  for (const route of routes) {
    if (matchRoute(route.path, currentPath)) {
      const params = extractParams(route.path, currentPath);

      return (
        <ProtectedRoute requireAuth={route.requireAuth} requiredRole={route.requiredRole}>
          {typeof route.component === 'function' ? route.component(params) : route.component}
        </ProtectedRoute>
      );
    }
  }

  return (
    notFoundComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">404</h1>
          <p className="text-muted-foreground">Page non trouvee</p>
        </div>
      </div>
    )
  );
};
