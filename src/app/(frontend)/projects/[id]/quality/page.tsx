'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    Bug,
    ShieldAlert,
    User,
    ArrowUpRight,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BugItem {
    id: string;
    title: string;
    status_code: string;
    priority_code: string;
    assignee: { id: string, full_name: string } | null;
    created_at: string;
}

interface QualityStats {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    by_severity: {
        URGENT: number;
        HIGH: number;
        MEDIUM: number;
        LOW: number;
    };
}

const SeverityBadge = ({ severity }: { severity: string }) => {
    const config: any = {
        URGENT: { label: 'CRITICAL', color: 'bg-rose-500 text-white' },
        HIGH: { label: 'MAJOR', color: 'bg-orange-500 text-white' },
        MEDIUM: { label: 'MINOR', color: 'bg-amber-500 text-white' },
        LOW: { label: 'TRIVIAL', color: 'bg-slate-400 text-white' },
    };
    const { label, color } = config[severity] || config.LOW;
    return (
        <Badge className={cn("border-none px-2 py-0 h-5 font-black text-[10px] tracking-widest", color)}>
            {label}
        </Badge>
    );
};

export default function QualityDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [bugs, setBugs] = useState<BugItem[]>([]);
    const [stats, setStats] = useState<QualityStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchQualityData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}/bugs`, {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            setBugs(data.bugs || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchQualityData();
    }, [id, user]);

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-96" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="quality-dashboard-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Tổng quan Dự án
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <Bug className="h-8 w-8 text-rose-600" />
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="quality-title">
                                Quality Dashboard
                            </h1>
                        </div>
                    </div>
                    <Button className="bg-rose-600 hover:bg-rose-700 font-bold h-11 px-6 shadow-lg shadow-rose-100">
                        <Bug className="mr-2 h-4 w-4" /> Báo cáo lỗi mới
                    </Button>
                </div>

                {/* Bug Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Tổng Bug</p>
                            <p className="text-3xl font-black text-slate-900">{stats?.total || 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-rose-600">Đang mở</p>
                            <p className="text-3xl font-black text-slate-900">{stats?.open || 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-amber-600">Đang xử lý</p>
                            <p className="text-3xl font-black text-slate-900">{stats?.in_progress || 0}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-600">Đã giải quyết</p>
                            <p className="text-3xl font-black text-slate-900">{stats?.resolved || 0}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Severity Breakdown */}
                <Card className="border-none shadow-sm bg-white mb-10 p-8">
                    <CardTitle className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-rose-600" />
                        Mức độ nghiêm trọng
                    </CardTitle>
                    <div className="space-y-6">
                        {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((sev: any) => {
                            const count = (stats?.by_severity as any)?.[sev] || 0;
                            const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                            const colors: any = {
                                URGENT: 'bg-rose-500',
                                HIGH: 'bg-orange-500',
                                MEDIUM: 'bg-amber-500',
                                LOW: 'bg-slate-400'
                            };
                            return (
                                <div key={sev} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{sev}</span>
                                        <span className="text-sm font-bold">{count} ({percent}%)</span>
                                    </div>
                                    <Progress value={percent} className="h-2 rounded-full bg-slate-100 overflow-hidden" />
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Bug List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-900 mb-4">Lỗi đang mở</h2>
                    {bugs.length > 0 ? (
                        bugs.map(bug => (
                            <Card key={bug.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow group">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-3">
                                                <SeverityBadge severity={bug.priority_code} />
                                                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                                                    {bug.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    {bug.assignee?.full_name || 'Chưa gán'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {new Date(bug.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="font-bold text-slate-600">Xem</Button>
                                            <Button variant="outline" size="sm" className="font-bold border-rose-100 text-rose-600 hover:bg-rose-50">Mark Resolved</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="bg-slate-50 rounded-3xl p-12 text-center">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Tuyệt vời! Không có bug nào đang mở</h3>
                            <p className="text-slate-500 text-sm">Tất cả các lỗi đã được giải quyết hoặc chưa có báo cáo mới.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

