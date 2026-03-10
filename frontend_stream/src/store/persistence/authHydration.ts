import type { User } from '../../types/auth';

export interface StoredAuthData {
  token: string;
  refreshToken?: string | null;
  user: User;
}

export interface HydratedAuthState {
  user: User;
  token: string;
  refreshToken?: string;
  isAuthenticated: boolean;
  sessionExpiry?: number | null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }

    const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);

    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractTokenExpiry(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const exp = payload.exp;
  if (typeof exp !== 'number') {
    return null;
  }

  return exp * 1000;
}

export function hydrateAuthState(stored: StoredAuthData): HydratedAuthState | null {
  const sessionExpiry = extractTokenExpiry(stored.token);
  const now = Date.now();

  if (sessionExpiry && sessionExpiry <= now && !stored.refreshToken) {
    return null;
  }

  return {
    user: stored.user,
    token: stored.token,
    refreshToken: stored.refreshToken || undefined,
    isAuthenticated: true,
    sessionExpiry,
  };
}
