import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { documentsApi } from '../../lib/api/documents';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

const routes = [
  { label: 'Dashboard', to: '/dashboard', hint: 'Overview and recent activity', roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Documents', to: '/documents', hint: 'Manage uploads and processing jobs', roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Chat', to: '/chat', hint: 'Talk to the RAG assistant', roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Models', to: '/models', hint: 'Switch available model profiles', roles: ['MANAGER', 'ADMIN'] },
  { label: 'Users', to: '/users', hint: 'Manage workspace operators and roles', roles: ['ADMIN'] },
  { label: 'Analytics', to: '/analytics', hint: 'Operational metrics and charts', roles: ['MANAGER', 'ADMIN'] },
  { label: 'Settings', to: '/settings', hint: 'Profile and theme controls', roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const open = useUIStore((state) => state.commandPaletteOpen);
  const close = useUIStore((state) => state.closeCommandPalette);
  const openPalette = useUIStore((state) => state.openCommandPalette);
  const role = useAuthStore((state) => state.user?.role_code || 'VIEWER');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openPalette();
      }
      if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, openPalette]);

  const { data } = useQuery({
    queryKey: ['command-doc-search', query],
    queryFn: async () => {
      const { data } = await documentsApi.list({ page_size: 5, search: query });
      return data.results || [];
    },
    enabled: open && query.trim().length > 1,
  });

  const filteredRoutes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const allowedRoutes = routes.filter((route) => route.roles.includes(role));
    if (!normalized) return allowedRoutes;
    return allowedRoutes.filter((route) => route.label.toLowerCase().includes(normalized) || route.hint.toLowerCase().includes(normalized));
  }, [query, role]);

  const documents = data || [];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/70 px-4 py-10" onClick={close}>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="mx-auto w-full max-w-3xl rounded-[28px] border border-[var(--border-subtle)] bg-[var(--panel)] shadow-[0_24px_100px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-5 py-4">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search documents or jump to a page..."
                className="border-0 bg-transparent px-0 py-0 text-base shadow-none focus:border-0 focus:shadow-none"
              />
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="border-b border-[var(--border-subtle)] p-4 lg:border-b-0 lg:border-r">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Navigation</p>
                <div className="mt-3 space-y-2">
                  {filteredRoutes.map((route) => (
                    <button
                      key={route.to}
                      type="button"
                      onClick={() => {
                        navigate(route.to);
                        close();
                        setQuery('');
                      }}
                      className="command-item"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{route.label}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{route.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Documents</p>
                <div className="mt-3 space-y-2">
                  {query.trim().length <= 1 ? (
                    <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                      Type at least two characters to search the document index.
                    </p>
                  ) : documents.length ? (
                    documents.map((document) => (
                      <button
                        key={document.id}
                        type="button"
                        onClick={() => {
                          navigate(`/documents?document=${document.id}`);
                          close();
                          setQuery('');
                        }}
                        className="command-item"
                      >
                        <span className="text-sm font-medium text-[var(--text-primary)]">{document.file_name}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{document.status} • {document.file_type || 'Unknown type'}</span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
                      No document matches found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
