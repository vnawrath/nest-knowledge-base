import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  apiFetch,
  apiFetchJson,
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
  try {
    return await apiFetchJson<AuthUser>('/api/auth/me');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    await loginRequest(email, password);
    setUser(await loadCurrentUser());
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await registerRequest(name, email, password);
      setUser(await loadCurrentUser());
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' }, false);
    clearAccessToken();
    setUser(null);
  }, []);

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
      loading,
      login,
      logout,
      register,
      user,
    }),
    [loading, login, logout, register, user],
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
