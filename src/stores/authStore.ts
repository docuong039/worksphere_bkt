import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    full_name: string;
    role?: string;
    org_id?: string | null;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;

    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            token: null,

            login: (user, token) => set({ user, token, isAuthenticated: true }),

            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
