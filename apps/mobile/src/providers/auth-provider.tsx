import { createContext, useContext, useCallback, useState, useMemo, type ReactNode } from 'react';
import { setAuthToken } from '@/services/api';

export interface User {
  id: string;
  email?: string;
  phone?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = useCallback((newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: token !== null,
      isLoading,
      signIn,
      signOut,
      setLoading,
    }),
    [token, user, isLoading, signIn, signOut, setLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
