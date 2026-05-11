import React, { createContext, useContext, useMemo, useState } from 'react';
import { apiFetch } from '../api';
import type { AuthUser } from './auth';
import { parseTenantSubdomain } from '../tenant';
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from './auth';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      async login(email: string, password: string) {
        const tenantSubdomain = parseTenantSubdomain(window.location.hostname);
        const res = await apiFetch<{
          accessToken: string;
          user: AuthUser;
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
            ...(tenantSubdomain ? { tenantSubdomain } : {}),
          }),
        });

        setStoredToken(res.accessToken);
        setStoredUser(res.user);
        setToken(res.accessToken);
        setUser(res.user);
      },
      logout() {
        clearStoredToken();
        clearStoredUser();
        setToken(null);
        setUser(null);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

