// Simple localStorage utilities for state persistence
export const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch {
      // Silently fail if localStorage is not available
    }
  }
};

// Helper functions for common storage operations
export const authStorage = {
  saveAuthData: (data: { token: string; refreshToken?: string; user: any }) => {
    storage.setItem('auth_token', data.token);
    if (data.refreshToken) {
      storage.setItem('auth_refresh_token', data.refreshToken);
    } else {
      storage.removeItem('auth_refresh_token');
    }
    storage.setItem('auth_user', JSON.stringify(data.user));
  },
  
  loadAuthData: () => {
    const token = storage.getItem('auth_token');
    const refreshToken = storage.getItem('auth_refresh_token');
    const userStr = storage.getItem('auth_user');
    
    if (!token || !userStr) {
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      return { token, refreshToken, user };
    } catch {
      return null;
    }
  },
  
  clearAuthData: () => {
    storage.removeItem('auth_token');
    storage.removeItem('auth_refresh_token');
    storage.removeItem('auth_user');
  }
};

export const uiStorage = {
  saveTheme: (theme: string) => {
    storage.setItem('ui_theme', theme);
  },
  
  loadTheme: (): string | null => {
    return storage.getItem('ui_theme');
  },
  
  saveLanguage: (language: string) => {
    storage.setItem('ui_language', language);
  },
  
  loadLanguage: (): string | null => {
    return storage.getItem('ui_language');
  }
};
