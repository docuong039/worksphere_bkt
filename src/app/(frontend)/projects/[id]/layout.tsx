'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
    LayoutDashboard,
    Layers,
    BarChart3,
    Clock,
    Shield,
    TrendingUp,
    History,
    FileText,
    FolderGit2,
    Settings,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function ProjectLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [projectName, setProjectName] = useState('Đang tải...');

    useEffect(() => {
        // Fetch basic project info for the header
        const fetchProjectInfo = async () => {
            try {
                const res = await fetch(`/api/projects/${id}`);
                const data = await res.json();
                setProjectName(data.name || 'Dự án');
            } catch (error) {
                setProjectName('Dự án');
            }
        };
        fetchProjectInfo();
    }, [id]);

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';
    const isCEO = user?.role === 'CEO';

    const tabs = [
        { name: 'Tổng quan', href: `/projects/${id}/overview`, icon: LayoutDashboard },
        { name: 'Công việc', href: `/projects/${id}`, icon: Layers, exact: true }, // CEO can monitor
        { name: 'Gantt', href: `/projects/${id}/gantt`, icon: BarChart3 }, // CEO can monitor
        { name: 'Chi phí', href: `/projects/${id}/cost`, icon: BarChart3, hidden: !isPM && !isCEO },
        { name: 'Chất lượng', href: `/projects/${id}/quality`, icon: Shield, hidden: isCEO }, // Specific to PM/QA
        { name: 'Hiệu suất', href: `/projects/${id}/performance`, icon: TrendingUp, hidden: isCEO }, // Specific to PM
        { name: 'Nhật ký', href: `/projects/${id}/activity`, icon: History },
        { name: 'Tài liệu', href: `/projects/${id}/documents`, icon: FileText },
        { name: 'Tài nguyên', href: `/projects/${id}/resources`, icon: FolderGit2, hidden: isCEO },
        { name: 'Cài đặt', href: `/projects/${id}/settings`, icon: Settings, hidden: !isPM }, // CEO monitors, PM updates
    ];

    return (
        <AppLayout>
            <div className="flex flex-col h-full space-y-6">
                {/* Project Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild className="h-9 w-9 bg-white shadow-sm border border-slate-200 rounded-xl">
                                <Link href="/projects">
                                    <ChevronLeft size={18} />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight" data-testid="project-header-name">{projectName}</h1>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                    <span data-testid="project-header-id">#{id.slice(0, 8).toUpperCase()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-blue-600" data-testid="project-header-status">Dự án đang triển khai</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit" data-testid="project-nav-tabs">
                        {tabs.filter(tab => !tab.hidden).map((tab) => {
                            const isActive = tab.exact
                                ? pathname === tab.href
                                : pathname.startsWith(tab.href);

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                                        isActive
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                    )}
                                    data-testid={`project-tab-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    <tab.icon size={16} />
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Sub-page Content */}
                <div className="flex-1 overflow-auto no-scrollbar">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        {children}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
