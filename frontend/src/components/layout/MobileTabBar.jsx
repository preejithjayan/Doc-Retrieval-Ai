import { ChartNoAxesCombined, FileStack, LayoutDashboard, MessageSquare, Settings2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuthStore } from '../../stores/authStore';

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Documents', to: '/documents', icon: FileStack, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Chat', to: '/chat', icon: MessageSquare, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
  { label: 'Analytics', to: '/analytics', icon: ChartNoAxesCombined, roles: ['MANAGER', 'ADMIN'] },
  { label: 'Settings', to: '/settings', icon: Settings2, roles: ['VIEWER', 'ANALYST', 'MANAGER', 'ADMIN'] },
];

export default function MobileTabBar() {
  const role = useAuthStore((state) => state.user?.role_code || 'VIEWER');
  const navItems = items.filter((item) => item.roles.includes(role));

  return (
    <nav className="mobile-tab-bar lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-tab-item ${isActive ? 'mobile-tab-item-active' : ''}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

