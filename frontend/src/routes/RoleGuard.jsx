import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { rolePriority, useAuthStore } from '../stores/authStore';

export default function RoleGuard({ allowedRoles }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user?.role_code || !allowedRoles.includes(user.role_code)) {
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

