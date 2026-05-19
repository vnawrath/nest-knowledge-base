import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  apiFetch,
  clearAccessToken,
  loginRequest,
  onAuthFailure,
  refreshAccessToken,
  registerRequest,
} from './api-client';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadCurrentUser(): Promise<AuthUser | null> {
  const response = await apiFetch('/api/auth/me');
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthFailure(() => {
      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    });

    void (async () => {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      const currentUser = await loadCurrentUser();
      if (!cancelled) {
        setUser(currentUser);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async login(email: string, password: string) {
        await loginRequest(email, password);
        setUser(await loadCurrentUser());
      },
      async register(name: string, email: string, password: string) {
        await registerRequest(name, email, password);
        setUser(await loadCurrentUser());
      },
      async logout() {
        await apiFetch('/api/auth/logout', { method: 'POST' }, false);
        clearAccessToken();
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
