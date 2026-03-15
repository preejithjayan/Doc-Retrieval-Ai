import { Bot, ChartColumnBig, Database, FileStack, Gauge, Settings2, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Overview', icon: Gauge, description: 'System status and KPIs' },
  { to: '/documents', label: 'Documents', icon: FileStack, description: 'Uploads and processing jobs' },
  { to: '/search', label: 'Semantic Search', icon: Database, description: 'Vector lookup and previews' },
  { to: '/chat', label: 'Chatbot', icon: Bot, description: 'RAG conversations and citations' },
  { to: '/models', label: 'Models', icon: Settings2, description: 'Inference routing' },
  { to: '/analytics', label: 'Analytics', icon: ChartColumnBig, description: 'Operational insights' },
  { to: '/users', label: 'Users', icon: Users, description: 'Role-based access control' },
];

export default function Sidebar({ user }) {
  const role = user?.role_code || 'VIEWER';
  const isManager = ['MANAGER', 'ADMIN'].includes(role);
  const isAdmin = role === 'ADMIN';

  const filteredLinks = links.filter((item) => {
    if (item.to === '/users') return isAdmin;
    if (item.to === '/analytics') return isManager;
    if (item.to === '/models') return isAdmin || isManager;
    return true;
  });

  return (
    <aside className="panel w-full shrink-0 lg:w-[296px]">
      <div className="border-b border-console-border bg-slate-50 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-console-muted">Navigation</p>
        <h2 className="mt-2 text-lg font-semibold text-console-text">Operations Workspace</h2>
        <div className="mt-3 flex items-center justify-between rounded-lg border border-console-border bg-white px-3 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-console-muted">Current Role</p>
            <p className="mt-1 text-sm font-semibold text-console-text">{role}</p>
          </div>
          <span className="tag-muted">RBAC</span>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-4 py-4 lg:flex-col lg:overflow-visible">
        {filteredLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `min-w-[210px] rounded-lg border px-4 py-3 lg:min-w-0 ${
                  isActive
                    ? 'border-console-blue bg-blue-50 text-console-blue'
                    : 'border-transparent bg-white text-console-text hover:border-console-border hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-console-muted">{item.description}</p>
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="hidden border-t border-console-border px-5 py-4 lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-console-muted">Service Summary</p>
        <div className="mt-3 space-y-2 text-sm text-console-muted">
          <div className="flex items-center justify-between">
            <span>OCR and parsing</span>
            <span className="font-semibold text-console-text">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Semantic retrieval</span>
            <span className="font-semibold text-console-text">ChromaDB</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Conversation mode</span>
            <span className="font-semibold text-console-text">RAG</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

