import { Bell, ChevronDown, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '../../lib/api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useModelStore } from '../../stores/modelStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUIStore } from '../../stores/uiStore';
import Badge from '../ui/Badge';
import Breadcrumbs from './Breadcrumbs';

export default function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const refresh = useAuthStore((state) => state.tokens?.refresh);
  const currentModel = useModelStore((state) => state.currentModel);
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const openCommandPalette = useUIStore((state) => state.openCommandPalette);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const source = user?.email || 'AI';
    return source.slice(0, 2).toUpperCase();
  }, [user?.email]);

  const handleLogout = async () => {
    try {
      if (refresh) {
        await authApi.logout({ refresh });
      }
    } catch (_error) {
      // Local logout keeps the UI safe if revocation fails.
    } finally {
      logout();
      setMenuOpen(false);
    }
  };

  return (
    <header className="glass-panel sticky top-3 z-20 rounded-[26px] px-4 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button type="button" onClick={toggleSidebar} className="icon-button hidden lg:inline-flex">
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="min-w-0">
            <Breadcrumbs />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Dense operational views for documents, retrieval, chat, models, and access control.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={openCommandPalette} className="control-chip min-w-[220px] justify-between">
            <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
              <Search size={15} />
              Search documents or jump to a page
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">Cmd+K</span>
          </button>

          <Badge tone="accent">{currentModel?.model_name || 'No Model'}</Badge>

          <button type="button" onClick={toggleTheme} className="control-chip">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]">{theme}</span>
          </button>

          <button type="button" className="icon-button">
            <Bell size={16} />
          </button>

          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((open) => !open)} className="control-chip gap-3 pr-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent-secondary),rgba(245,158,11,0.25))] font-mono text-xs font-semibold text-black">
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.email}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{user?.role_code}</p>
              </div>
              <ChevronDown size={16} className="text-[var(--text-muted)]" />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 w-64 rounded-2xl border border-[var(--border-subtle)] bg-[var(--panel)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setMenuOpen(false);
                  }}
                  className="menu-item"
                >
                  Settings
                </button>
                <button type="button" onClick={handleLogout} className="menu-item text-[var(--danger)]">
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
