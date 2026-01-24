import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ROLE_PERMISSIONS, AppPermission, AppRole } from '@/lib/permissions';

interface User {
    id: string;
    email: string;
    full_name: string;
    role: AppRole;
    org_id?: string | null;
    permissions: string[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;

    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;

    // Helpers
    hasPermission: (permission: AppPermission) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            token: null,

            login: (user, token) => {
                const permissions = user.permissions || ROLE_PERMISSIONS[user.role] || [];
                set({ user: { ...user, permissions }, token, isAuthenticated: true });
            },

            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                })),

            hasPermission: (permission: AppPermission) => {
                const user = get().user;
                if (!user) return false;

                // SYS_ADMIN has all permissions
                if (user.role === 'SYS_ADMIN') return true;

                const permissions = user.permissions || ROLE_PERMISSIONS[user.role] || [];
                return permissions.includes(permission);
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
