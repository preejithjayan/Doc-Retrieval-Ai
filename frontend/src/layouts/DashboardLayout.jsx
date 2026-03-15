import { Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-console-bg text-console-muted">Loading workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-console-bg">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:px-5">
        <Navbar user={user} />
        <div className="mt-4 flex flex-1 flex-col gap-4 lg:flex-row">
          <Sidebar user={user} />
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

