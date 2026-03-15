import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const initialTokens = {
  access: null,
  refresh: null,
  remember: true,
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokens: initialTokens,
      bootstrapped: false,
      login: ({ user, access, refresh, remember = true }) =>
        set({
          user,
          tokens: { access, refresh, remember },
        }),
      setUser: (user) => set({ user }),
      refreshToken: (access, refresh) =>
        set((state) => ({
          tokens: {
            ...state.tokens,
            access,
            refresh: refresh || state.tokens.refresh,
          },
        })),
      logout: () =>
        set({
          user: null,
          tokens: initialTokens,
        }),
      finishBootstrap: () => set({ bootstrapped: true }),
    }),
    {
      name: 'doc-retrieval-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

export const rolePriority = {
  VIEWER: 1,
  ANALYST: 2,
  MANAGER: 3,
  ADMIN: 4,
};

