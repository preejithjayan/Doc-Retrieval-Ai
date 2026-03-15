import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as authApi from '../api/authApi';
import { ensureAuthPayload } from '../utils/apiErrors';
import { ROLE_PRIORITY } from '../utils/constants';
import {
  clearStoredAuth,
  getAccessToken,
  getRefreshToken,
  getStoredAuth,
  getStoredUser,
  setStoredAuth,
} from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [authReady, setAuthReady] = useState(false);

  const loadSession = useCallback(async () => {
    const auth = getStoredAuth();
    if (!auth?.accessToken && !auth?.refreshToken) {
      setUser(null);
      setAuthReady(true);
      return null;
    }

    try {
      const response = await authApi.getSession();
      setStoredAuth({
        ...(auth ?? {}),
        user: response.user,
      });
      setUser(response.user);
      return response.user;
    } catch {
      clearStoredAuth();
      setUser(null);
      return null;
    } finally {
      setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const handleForcedLogout = () => {
      clearStoredAuth();
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:logout', handleForcedLogout);
    return () => window.removeEventListener('auth:logout', handleForcedLogout);
  }, [navigate]);

  const signIn = useCallback(async (credentials) => {
    const response = ensureAuthPayload(await authApi.login(credentials));
    setStoredAuth({
      accessToken: response.access,
      refreshToken: response.refresh,
      user: response.user,
    });
    setUser(response.user);
    return response.user;
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout({ refresh: refreshToken });
      }
    } catch {
      // Client-side logout should still complete.
    } finally {
      clearStoredAuth();
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const refreshUser = useCallback(async () => loadSession(), [loadSession]);

  const hasMinimumRole = useCallback(
    (requiredRole) => {
      if (!requiredRole) {
        return true;
      }
      const currentPriority = ROLE_PRIORITY[user?.role_code] ?? 0;
      const requiredPriority = ROLE_PRIORITY[requiredRole] ?? 0;
      return currentPriority >= requiredPriority;
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken: getAccessToken(),
      isAuthenticated: Boolean(user && getAccessToken()),
      authReady,
      signIn,
      signOut,
      refreshUser,
      hasMinimumRole,
    }),
    [user, authReady, signIn, signOut, refreshUser, hasMinimumRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
