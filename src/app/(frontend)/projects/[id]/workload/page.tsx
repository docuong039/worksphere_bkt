'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Users,
    Clock,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    TrendingUp,
    Calendar,
    RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface MemberWorkload {
    user_id: string;
    full_name: string;
    position: string;
    tasks_assigned: number;
    tasks_completed: number;
    tasks_overdue: number;
    hours_logged: number;
    hours_estimated: number;
    workload_percent: number;
    status: 'UNDERLOAD' | 'OPTIMAL' | 'OVERLOAD';
}

export default function WorkloadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<MemberWorkload[]>([]);
    const [projectName, setProjectName] = useState('');

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-02-02/03
            const mockMembers: MemberWorkload[] = [
                { user_id: 'u1', full_name: 'Nguyễn Văn A', position: 'Senior Developer', tasks_assigned: 12, tasks_completed: 8, tasks_overdue: 1, hours_logged: 45, hours_estimated: 50, workload_percent: 90, status: 'OPTIMAL' },
                { user_id: 'u2', full_name: 'Trần Thị B', position: 'Middle Developer', tasks_assigned: 15, tasks_completed: 5, tasks_overdue: 3, hours_logged: 60, hours_estimated: 45, workload_percent: 133, status: 'OVERLOAD' },
                { user_id: 'u3', full_name: 'Lê Văn C', position: 'UI/UX Designer', tasks_assigned: 6, tasks_completed: 4, tasks_overdue: 0, hours_logged: 20, hours_estimated: 40, workload_percent: 50, status: 'UNDERLOAD' },
                { user_id: 'u4', full_name: 'Phạm Thị D', position: 'QA Engineer', tasks_assigned: 10, tasks_completed: 6, tasks_overdue: 0, hours_logged: 38, hours_estimated: 40, workload_percent: 95, status: 'OPTIMAL' },
                { user_id: 'u5', full_name: 'Hoàng Văn E', position: 'Junior Developer', tasks_assigned: 18, tasks_completed: 6, tasks_overdue: 4, hours_logged: 70, hours_estimated: 50, workload_percent: 140, status: 'OVERLOAD' },
                { user_id: 'u6', full_name: 'Vũ Thị F', position: 'Backend Developer', tasks_assigned: 4, tasks_completed: 2, tasks_overdue: 0, hours_logged: 15, hours_estimated: 45, workload_percent: 33, status: 'UNDERLOAD' },
            ];

            setMembers(mockMembers.sort((a, b) => b.workload_percent - a.workload_percent));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkloadColor = (percent: number) => {
        if (percent > 110) return 'bg-red-500';
        if (percent >= 80) return 'bg-emerald-500';
        return 'bg-amber-500';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OVERLOAD': return <Badge className="bg-red-100 text-red-700">Quá tải</Badge>;
            case 'OPTIMAL': return <Badge className="bg-emerald-100 text-emerald-700">Hợp lý</Badge>;
            case 'UNDERLOAD': return <Badge className="bg-amber-100 text-amber-700">Thiếu việc</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const stats = {
        overload: members.filter(m => m.status === 'OVERLOAD').length,
        optimal: members.filter(m => m.status === 'OPTIMAL').length,
        underload: members.filter(m => m.status === 'UNDERLOAD').length,
        totalHours: members.reduce((sum, m) => sum + m.hours_logged, 0),
        totalOverdue: members.reduce((sum, m) => sum + m.tasks_overdue, 0),
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="workload-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/overview`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại {projectName}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <BarChart3 className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Phân bố công việc
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Theo dõi workload của team (US-MNG-02-02/03)
                            </p>
                        </div>
                        <Button variant="outline" onClick={fetchData} data-testid="btn-refresh">
                            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-none shadow-sm border-l-4 border-l-red-500" data-testid="stat-overload">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Quá tải</p>
                            <p className="text-2xl font-bold text-red-600">{stats.overload}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm border-l-4 border-l-emerald-500" data-testid="stat-optimal">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Hợp lý</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.optimal}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm border-l-4 border-l-amber-500" data-testid="stat-underload">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Thiếu việc</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.underload}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-hours">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Tổng giờ</p>
                            <p className="text-2xl font-bold">{stats.totalHours}h</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm" data-testid="stat-overdue">
                        <CardContent className="p-4">
                            <p className="text-xs text-slate-500 font-medium">Tasks trễ</p>
                            <p className="text-2xl font-bold text-red-600">{stats.totalOverdue}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Legend */}
                <Card className="border-none shadow-sm" data-testid="legend-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-8 bg-red-500 rounded" />
                                <span className="text-sm text-slate-600">&gt;110% Quá tải</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-8 bg-emerald-500 rounded" />
                                <span className="text-sm text-slate-600">80-110% Hợp lý</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-8 bg-amber-500 rounded" />
                                <span className="text-sm text-slate-600">&lt;80% Thiếu việc</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Workload Grid */}
                <Card className="border-none shadow-sm" data-testid="workload-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Chi tiết Workload</CardTitle>
                        <CardDescription>Phân tích khối lượng công việc theo thành viên</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-24 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4" data-testid="workload-list">
                                {members.map(member => (
                                    <div
                                        key={member.user_id}
                                        className="p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                                        data-testid={`member-${member.user_id}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                                    {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-bold text-slate-900" data-testid={`member-name-${member.user_id}`}>
                                                            {member.full_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{member.position}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {getStatusBadge(member.status)}
                                                        <span className={`text-lg font-bold ${member.status === 'OVERLOAD' ? 'text-red-600' : member.status === 'OPTIMAL' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {member.workload_percent}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${getWorkloadColor(member.workload_percent)}`}
                                                        style={{ width: `${Math.min(member.workload_percent, 150)}%` }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-400">Tasks</p>
                                                        <p className="font-medium">{member.tasks_completed}/{member.tasks_assigned}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Overdue</p>
                                                        <p className={`font-medium ${member.tasks_overdue > 0 ? 'text-red-600' : ''}`}>
                                                            {member.tasks_overdue}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Logged</p>
                                                        <p className="font-medium">{member.hours_logged}h</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-400">Estimated</p>
                                                        <p className="font-medium">{member.hours_estimated}h</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recommendations */}
                {stats.overload > 0 && (
                    <Card className="border-none shadow-sm bg-gradient-to-r from-red-50 to-orange-50" data-testid="recommendations-card">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-800 mb-2">Cảnh báo quá tải</h3>
                                    <p className="text-sm text-red-700 mb-3">
                                        Có <strong>{stats.overload} thành viên</strong> đang quá tải công việc.
                                        Cân nhắc phân bổ lại tasks cho các thành viên còn capacity.
                                    </p>
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700" asChild>
                                        <Link href={`/projects/${projectId}/bulk-assign`} data-testid="btn-rebalance">
                                            <Users className="mr-2 h-4 w-4" />
                                            Phân công lại
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
