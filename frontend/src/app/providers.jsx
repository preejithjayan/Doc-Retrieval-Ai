import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import { apiClient } from '../lib/api/client';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}

function AuthBootstrap() {
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.logout);
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      if (!tokens?.access && !tokens?.refresh) {
        finishBootstrap();
        return;
      }

      if (user) {
        finishBootstrap();
        return;
      }

      try {
        const { data } = await apiClient.get('/auth/session');
        if (mounted) {
          setUser(data.user);
        }
      } catch (error) {
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          finishBootstrap();
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [tokens?.access, tokens?.refresh, user, setUser, clearSession, finishBootstrap]);

  return null;
}

export default function AppProviders({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <AuthBootstrap />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--panel)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

