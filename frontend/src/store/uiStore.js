import { create } from 'zustand';

export const useUIStore = create((set) => ({
  mobileMenuOpen: false,
  chatHistoryOpen: true,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  toggleChatHistory: () => set((state) => ({ chatHistoryOpen: !state.chatHistoryOpen })),
}));
