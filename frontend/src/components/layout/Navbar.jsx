import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Sparkles, UserCircle2, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useUIStore } from '../../store/uiStore';
import Button from '../ui/Button';

function NavbarLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm font-medium transition ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          <span
            className={`absolute inset-x-3 -bottom-1 h-[2px] rounded-full bg-cyan transition ${
              isActive ? 'scale-x-100 opacity-100 shadow-glow' : 'scale-x-0 opacity-0'
            }`}
          />
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const location = useLocation();
  const { user, hasMinimumRole, signOut } = useAuth();
  const { mobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}` || user?.email?.[0]?.toUpperCase() || 'U';

  const links = [
    { to: '/dashboard', label: 'Dashboard', show: true },
    { to: '/documents', label: 'Documents', show: true },
    { to: '/chat', label: 'Chat', show: true },
    { to: '/analytics', label: 'Analytics', show: hasMinimumRole('MANAGER') },
    { to: '/models', label: 'Models', show: hasMinimumRole('ADMIN') },
    { to: '/users', label: 'Users', show: hasMinimumRole('ADMIN') },
  ].filter((item) => item.show);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel neural-outline mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-3 sm:px-6">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan/25 bg-cyan/10 shadow-glow">
            <Sparkles className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-wide text-white [text-shadow:0_0_20px_rgba(0,229,255,0.25),1px_1px_0_rgba(124,58,237,0.22)]">
              DocuMind
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan/70">Neural Intelligence</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavbarLink key={link.to} to={link.to} label={link.label} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:flex"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle profile menu"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-violet/30 font-mono text-sm">
              {initials}
            </span>
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            className="glass-panel neural-outline mx-auto mt-3 max-w-7xl rounded-[28px] p-4 lg:hidden"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
          >
            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    location.pathname === link.to
                      ? 'border-cyan/25 bg-cyan/10 text-cyan'
                      : 'border-white/10 bg-white/5 text-slate-300'
                  }`}
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
              >
                Profile
              </NavLink>
              <Button
                type="button"
                variant="secondary"
                className="justify-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut();
                }}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="glass-panel neural-outline absolute right-8 top-[88px] hidden w-64 rounded-[28px] p-4 lg:block"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <UserCircle2 className="h-10 w-10 text-cyan" />
              <div>
                <p className="font-medium text-white">{user?.full_name || user?.email}</p>
                <p className="text-sm text-slate-400">{user?.role_code}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              <NavLink
                to="/profile"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>
              <Button
                type="button"
                variant="secondary"
                className="justify-center"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
