import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ minimumRole }) {
  const { hasMinimumRole } = useAuth();

  if (!hasMinimumRole(minimumRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
