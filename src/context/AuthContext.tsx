import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (role: UserRole, payload: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  currentPath: string;
  navigateTo: (path: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  currentPath: '/login',
  navigateTo: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nm_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/login');

  // Sync browser path
  const navigateTo = (path: string) => {
    // Route authorization check before updating path
    if (user) {
      if (user.role === 'CITIZEN' && (path.startsWith('/government') || path.startsWith('/field-worker'))) {
        path = '/citizen/home';
      } else if (user.role === 'GOVERNMENT' && (path.startsWith('/citizen') || path.startsWith('/field-worker'))) {
        path = '/government/overview';
      } else if (user.role === 'FIELD_WORKER' && (path.startsWith('/citizen') || path.startsWith('/government'))) {
        path = '/field-worker/today';
      }
    } else {
      path = '/login';
    }

    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Listen to popstate
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (user) {
        if (user.role === 'CITIZEN' && (path.startsWith('/government') || path.startsWith('/field-worker'))) {
          setCurrentPath('/citizen/home');
          return;
        }
        if (user.role === 'GOVERNMENT' && (path.startsWith('/citizen') || path.startsWith('/field-worker'))) {
          setCurrentPath('/government/overview');
          return;
        }
        if (user.role === 'FIELD_WORKER' && (path.startsWith('/citizen') || path.startsWith('/government'))) {
          setCurrentPath('/field-worker/today');
          return;
        }
      }
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [user]);

  // Check existing session
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('nm_token');
      if (!storedToken) {
        setIsLoading(false);
        setCurrentPath('/login');
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(storedToken);

          // Route to appropriate shell
          if (data.user.role === 'CITIZEN') {
            if (!window.location.pathname.startsWith('/citizen')) {
              navigateTo('/citizen/home');
            }
          } else if (data.user.role === 'GOVERNMENT') {
            if (!window.location.pathname.startsWith('/government')) {
              navigateTo('/government/overview');
            }
          } else if (data.user.role === 'FIELD_WORKER') {
            if (!window.location.pathname.startsWith('/field-worker')) {
              navigateTo('/field-worker/today');
            }
          }
        } else {
          localStorage.removeItem('nm_token');
          setUser(null);
          setToken(null);
          setCurrentPath('/login');
        }
      } catch (err) {
        console.error('Session verification error:', err);
        localStorage.removeItem('nm_token');
        setUser(null);
        setToken(null);
        setCurrentPath('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (role: UserRole, payload: Record<string, any>) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...payload })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('nm_token', data.token);

      // Redirect strictly based on backend verified role
      if (data.user.role === 'CITIZEN') {
        navigateTo('/citizen/home');
      } else if (data.user.role === 'GOVERNMENT') {
        navigateTo('/government/overview');
      } else if (data.user.role === 'FIELD_WORKER') {
        navigateTo('/field-worker/today');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('nm_token');
    setUser(null);
    setToken(null);
    navigateTo('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, currentPath, navigateTo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
