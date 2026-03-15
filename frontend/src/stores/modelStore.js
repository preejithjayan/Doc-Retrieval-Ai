import { create } from 'zustand';

export const useModelStore = create((set) => ({
  currentModel: null,
  catalog: [],
  setModelData: ({ currentModel, catalog }) => set({ currentModel, catalog }),
  setCurrentModel: (currentModel) => set({ currentModel }),
}));

