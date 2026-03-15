import { Bot, ChartNoAxesCombined, FileStack, LayoutDashboard, LogOut, Settings2, Sparkles, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Documents', to: '/documents', icon: FileStack, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Chat', to: '/chat', icon: Bot, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Models', to: '/models', icon: Sparkles, roles: ['MANAGER', 'ADMIN'] },
  { label: 'Users', to: '/users', icon: Users, roles: ['ADMIN'] },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined, roles: ['MANAGER', 'ADMIN'] },
  { label: 'Settings', to: '/settings', icon: Settings2, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refresh = useAuthStore((state) => state.tokens?.refresh);
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const role = user?.role_code || 'VIEWER';
  const navItems = items.filter((item) => item.roles.includes(role));

  const handleLogout = async () => {
    try {
      if (refresh) {
        await authApi.logout({ refresh });
      }
    } catch (_error) {
      // Clear local auth state even if token revocation is unavailable.
    } finally {
      logout();
    }
  };

  return (
    <aside className={`hidden lg:flex lg:flex-col ${collapsed ? 'w-[92px]' : 'w-[292px]'}`}>
      <div className="glass-panel flex h-full flex-col rounded-[26px] px-3 py-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-2xl border border-white/5 bg-black/20 px-3 py-4`}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-primary),rgba(34,211,238,0.3))] font-mono text-sm font-bold text-black">
            DR
          </div>
          {!collapsed ? (
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.36em] text-[var(--text-muted)]">Workspace</p>
              <p className="mt-1 text-sm font-semibold text-white">Retrieval Console</p>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center rounded-2xl px-3 py-3 transition ${
                    collapsed ? 'justify-center' : 'gap-3'
                  } ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(14,165,233,0.08))] text-white shadow-[0_0_0_1px_rgba(34,211,238,0.18)]'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed ? <span className="text-sm font-medium">{item.label}</span> : null}
              </NavLink>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-white/6 bg-black/20 p-3">
          {!collapsed ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Role</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{role}</span>
                <span className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  RBAC
                </span>
              </div>
            </>
          ) : (
            <div className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{role}</div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className={`mt-3 flex items-center rounded-2xl border border-white/6 bg-black/20 px-3 py-3 text-[var(--text-secondary)] transition hover:border-[var(--danger)]/30 hover:text-white ${collapsed ? 'justify-center' : 'gap-3'}`}
        >
          <LogOut size={18} />
          {!collapsed ? <span className="text-sm font-medium">Logout</span> : null}
        </button>
      </div>
    </aside>
  );
}
