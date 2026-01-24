'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '@/stores/authStore';

import { Toaster } from '../ui/toaster';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        // Simple auth check
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50/50" data-testid="app-layout-root">
            {/* fixed sidebar */}
            <Sidebar />

            {/* main content area */}
            <div className="flex-1 flex flex-col ml-64 min-h-screen">
                <Navbar />
                <main className="flex-1 p-6 md:p-8" data-testid="app-layout-content">
                    {children}
                </main>
            </div>
            <Toaster />
        </div>
    );
}
