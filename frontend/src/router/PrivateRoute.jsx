import { Navigate, Outlet, useLocation } from 'react-router-dom';

import LoadingScreen from '../components/ui/LoadingScreen';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute() {
  const location = useLocation();
  const { authReady, isAuthenticated } = useAuth();

  if (!authReady) {
    return <LoadingScreen label="Validating session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
