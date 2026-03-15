import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import {
  clearStoredUser,
  clearTokens,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!getRefreshToken()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.session();
        setUser(data.user);
        setStoredUser(data.user);
      } catch (error) {
        clearTokens();
        clearStoredUser();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(payload) {
        const { data } = await authService.login(payload);
        setTokens(data.access, data.refresh);
        setStoredUser(data.user);
        setUser(data.user);
        return data;
      },
      async register(payload) {
        const { data } = await authService.register(payload);
        return data;
      },
      async logout() {
        try {
          if (getRefreshToken()) {
            await authService.logout({ refresh: getRefreshToken() });
          }
        } finally {
          clearTokens();
          clearStoredUser();
          setUser(null);
        }
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

