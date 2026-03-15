import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const labels = {
  dashboard: 'Dashboard',
  documents: 'Documents',
  chat: 'Chat',
  models: 'Models',
  users: 'Users',
  analytics: 'Analytics',
  settings: 'Settings',
  login: 'Login',
  register: 'Register',
};

export default function Breadcrumbs() {
  const location = useLocation();

  const parts = useMemo(() => {
    return location.pathname
      .split('/')
      .filter(Boolean)
      .map((part) => labels[part] || part.charAt(0).toUpperCase() + part.slice(1));
  }, [location.pathname]);

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--text-muted)]">
      <span>Workspace</span>
      {parts.map((part) => (
        <span key={part} className="inline-flex items-center gap-2">
          <span className="text-[var(--text-dim)]">/</span>
          <span className="text-[var(--text-secondary)]">{part}</span>
        </span>
      ))}
    </div>
  );
}

