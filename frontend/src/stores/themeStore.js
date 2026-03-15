import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'doc-retrieval-theme',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

