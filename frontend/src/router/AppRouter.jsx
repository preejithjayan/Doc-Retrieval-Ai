import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import Navbar from '../components/layout/Navbar';
import LoadingScreen from '../components/ui/LoadingScreen';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

const Analytics = lazy(() => import('../pages/Analytics'));
const Chat = lazy(() => import('../pages/Chat'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const DocumentDetail = lazy(() => import('../pages/DocumentDetail'));
const Documents = lazy(() => import('../pages/Documents'));
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Models = lazy(() => import('../pages/Models'));
const PasswordReset = lazy(() => import('../pages/PasswordReset'));
const PasswordResetConfirm = lazy(() => import('../pages/PasswordResetConfirm'));
const Profile = lazy(() => import('../pages/Profile'));
const Register = lazy(() => import('../pages/Register'));
const Users = lazy(() => import('../pages/Users'));

function ProtectedLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route element={<RoleRoute minimumRole="MANAGER" />}>
          <Route path="/analytics" element={<Analytics />} />
        </Route>
        <Route element={<RoleRoute minimumRole="ADMIN" />}>
          <Route path="/models" element={<Models />} />
          <Route path="/users" element={<Users />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default function AppRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingScreen label="Loading route" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
          <Route element={<PrivateRoute />}>
            <Route path="/*" element={<ProtectedLayout />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
