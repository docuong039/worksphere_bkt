import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    currentPage: string;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    currentPage: 'dashboard',

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    setCurrentPage: (page) => set({ currentPage: page }),
}));
