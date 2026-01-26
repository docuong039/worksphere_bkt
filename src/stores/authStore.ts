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
    is_impersonating?: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    originalUser: User | null; // Stores the Admin user while impersonating
    isImpersonating: boolean;

    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    startImpersonation: (impersonatedUser: User, token: string) => void;
    stopImpersonating: () => void;

    // Helpers
    hasPermission: (permission: AppPermission) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            token: null,
            originalUser: null,
            isImpersonating: false,

            login: (user, token) => {
                const permissions = user.permissions || ROLE_PERMISSIONS[user.role] || [];
                set({ user: { ...user, permissions }, token, isAuthenticated: true });
            },

            logout: () => set({ user: null, token: null, isAuthenticated: false }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                })),

            startImpersonation: (newUser, newToken) => {
                const state = get();
                // Avoid nested impersonation, only save the FIRST (Admin) user as original
                const originalUser = state.isImpersonating ? state.originalUser : state.user;
                const permissions = newUser.permissions || ROLE_PERMISSIONS[newUser.role] || [];

                set({
                    user: { ...newUser, permissions, is_impersonating: true },
                    token: newToken,
                    isAuthenticated: true,
                    isImpersonating: true,
                    originalUser
                });
            },

            stopImpersonating: () => {
                const state = get();
                if (!state.originalUser) return;

                set({
                    user: state.originalUser,
                    // In a real app, you'd probably need to restore the original token too
                    // but for this mock we'll keep it simple
                    isImpersonating: false,
                    originalUser: null
                });
            },

            hasPermission: (permission: AppPermission) => {
                const user = get().user;
                if (!user) return false;

                // SYS_ADMIN has all permissions
                if (user.role === 'SYS_ADMIN') return true;

                // Merge permissions from user object (if any) and current role presets
                const basePermissions = ROLE_PERMISSIONS[user.role] || [];
                const userPermissions = user.permissions || [];
                const allPermissions = Array.from(new Set([...basePermissions, ...userPermissions]));

                return allPermissions.includes(permission as any);
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
