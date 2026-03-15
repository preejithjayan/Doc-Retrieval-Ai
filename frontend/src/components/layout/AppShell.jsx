import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

import { modelsApi } from '../../lib/api/models';
import { useModelStore } from '../../stores/modelStore';
import MobileTabBar from './MobileTabBar';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const location = useLocation();
  const setModelData = useModelStore((state) => state.setModelData);

  useQuery({
    queryKey: ['model-current'],
    queryFn: async () => {
      const { data } = await modelsApi.current();
      setModelData({ currentModel: data.current, catalog: data.catalog || [] });
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 px-3 pb-24 pt-3 lg:px-4 lg:pb-4">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Topbar />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="min-w-0 flex-1"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}

