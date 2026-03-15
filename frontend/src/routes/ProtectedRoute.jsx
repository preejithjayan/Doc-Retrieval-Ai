import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute() {
  const tokens = useAuthStore((state) => state.tokens);
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const location = useLocation();

  if (!bootstrapped) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] text-[var(--text-secondary)]">Loading workspace...</div>;
  }

  if (!tokens?.access && !tokens?.refresh) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

