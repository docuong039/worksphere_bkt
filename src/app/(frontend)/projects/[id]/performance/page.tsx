'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    BarChart3,
    Users,
    CheckCircle2,
    Clock,
    TrendingUp,
    TrendingDown,
    Calendar,
    RefreshCw,
    Target,
    Award,
    FileText,
    AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface MemberPerformance {
    user_id: string;
    full_name: string;
    position: string;
    tasks_completed: number;
    tasks_total: number;
    completion_rate: number;
    on_time_rate: number;
    hours_logged: number;
    avg_task_duration: number;
    rank: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
}

interface PerformanceSummary {
    total_tasks: number;
    completed_tasks: number;
    avg_completion_rate: number;
    avg_on_time_rate: number;
    total_hours: number;
    top_performer_id: string;
}

export default function PerformancePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<MemberPerformance[]>([]);
    const [summary, setSummary] = useState<PerformanceSummary | null>(null);
    const [projectName, setProjectName] = useState('');
    const [timeRange, setTimeRange] = useState('month');

    useEffect(() => {
        fetchData();
    }, [projectId, timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-03-03/04
            const mockMembers: MemberPerformance[] = [
                { user_id: 'u1', full_name: 'Nguyễn Văn A', position: 'Senior Developer', tasks_completed: 24, tasks_total: 26, completion_rate: 92, on_time_rate: 88, hours_logged: 165, avg_task_duration: 6.8, rank: 1, trend: 'UP' },
                { user_id: 'u2', full_name: 'Trần Thị B', position: 'Middle Developer', tasks_completed: 18, tasks_total: 22, completion_rate: 82, on_time_rate: 78, hours_logged: 140, avg_task_duration: 7.7, rank: 2, trend: 'STABLE' },
                { user_id: 'u3', full_name: 'Lê Văn C', position: 'UI/UX Designer', tasks_completed: 15, tasks_total: 16, completion_rate: 94, on_time_rate: 93, hours_logged: 120, avg_task_duration: 8, rank: 3, trend: 'UP' },
                { user_id: 'u4', full_name: 'Phạm Thị D', position: 'QA Engineer', tasks_completed: 28, tasks_total: 32, completion_rate: 87, on_time_rate: 84, hours_logged: 155, avg_task_duration: 5.5, rank: 4, trend: 'DOWN' },
                { user_id: 'u5', full_name: 'Hoàng Văn E', position: 'Junior Developer', tasks_completed: 12, tasks_total: 18, completion_rate: 67, on_time_rate: 58, hours_logged: 130, avg_task_duration: 10.8, rank: 5, trend: 'DOWN' },
            ];

            const mockSummary: PerformanceSummary = {
                total_tasks: 114,
                completed_tasks: 97,
                avg_completion_rate: 85,
                avg_on_time_rate: 80,
                total_hours: 710,
                top_performer_id: 'u1',
            };

            setMembers(mockMembers);
            setSummary(mockSummary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'UP': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
            case 'DOWN': return <TrendingDown className="h-4 w-4 text-red-500" />;
            default: return <span className="text-slate-400">—</span>;
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <Badge className="bg-amber-400 text-white">🥇 #1</Badge>;
        if (rank === 2) return <Badge className="bg-slate-400 text-white">🥈 #2</Badge>;
        if (rank === 3) return <Badge className="bg-orange-400 text-white">🥉 #3</Badge>;
        return <Badge variant="outline">#{rank}</Badge>;
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="performance-page">
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
                                Hiệu suất Team
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Phân tích productivity của team (US-MNG-03-03/04)
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                                    <SelectValue placeholder="Thời gian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Tuần này</SelectItem>
                                    <SelectItem value="month">Tháng này</SelectItem>
                                    <SelectItem value="quarter">Quý này</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={fetchData} data-testid="btn-refresh">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4" data-testid="loading-skeleton">
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                ) : summary && (
                    <>
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <Card className="border-none shadow-sm" data-testid="stat-tasks">
                                <CardContent className="p-4">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">Tasks hoàn thành</p>
                                    <p className="text-xl font-bold">{summary.completed_tasks}/{summary.total_tasks}</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm" data-testid="stat-completion">
                                <CardContent className="p-4">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                                        <Target className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">Completion Rate TB</p>
                                    <p className="text-xl font-bold text-emerald-600">{summary.avg_completion_rate}%</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm" data-testid="stat-ontime">
                                <CardContent className="p-4">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                                        <Clock className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">On-time Rate TB</p>
                                    <p className="text-xl font-bold text-purple-600">{summary.avg_on_time_rate}%</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm" data-testid="stat-hours">
                                <CardContent className="p-4">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                                        <Calendar className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">Tổng giờ</p>
                                    <p className="text-xl font-bold">{summary.total_hours}h</p>
                                </CardContent>
                            </Card>
                            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-50" data-testid="stat-top">
                                <CardContent className="p-4">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                                        <Award className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <p className="text-xs text-slate-500">Top Performer</p>
                                    <p className="text-sm font-bold truncate">
                                        {members.find(m => m.user_id === summary.top_performer_id)?.full_name}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Performance Table */}
                        <Card className="border-none shadow-sm" data-testid="performance-card">
                            <CardHeader className="border-b border-slate-100">
                                <CardTitle className="text-lg font-bold">Bảng xếp hạng</CardTitle>
                                <CardDescription>Hiệu suất làm việc của từng thành viên</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4" data-testid="performance-list">
                                    {members.sort((a, b) => a.rank - b.rank).map(member => (
                                        <div
                                            key={member.user_id}
                                            className={`p-4 rounded-xl border transition-colors ${member.rank <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent border-amber-200' : 'bg-slate-50/50 border-slate-200'}`}
                                            data-testid={`member-${member.user_id}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-center w-12">
                                                    {getRankBadge(member.rank)}
                                                </div>
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                                                        {member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-900">{member.full_name}</p>
                                                        {getTrendIcon(member.trend)}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{member.position}</p>
                                                </div>
                                                <div className="grid grid-cols-4 gap-6 text-center">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Tasks</p>
                                                        <p className="font-bold">{member.tasks_completed}/{member.tasks_total}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">Complete</p>
                                                        <p className={`font-bold ${member.completion_rate >= 80 ? 'text-emerald-600' : member.completion_rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                            {member.completion_rate}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">On-time</p>
                                                        <p className={`font-bold ${member.on_time_rate >= 80 ? 'text-emerald-600' : member.on_time_rate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                            {member.on_time_rate}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">Giờ</p>
                                                        <p className="font-bold">{member.hours_logged}h</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Alerts */}
                        {members.some(m => m.completion_rate < 70 || m.on_time_rate < 70) && (
                            <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-orange-50" data-testid="alerts-card">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-amber-800 mb-2">Cần chú ý</h3>
                                            <ul className="text-sm text-amber-700 space-y-1">
                                                {members.filter(m => m.completion_rate < 70).map(m => (
                                                    <li key={`comp-${m.user_id}`}>• {m.full_name} có completion rate thấp ({m.completion_rate}%)</li>
                                                ))}
                                                {members.filter(m => m.on_time_rate < 70).map(m => (
                                                    <li key={`time-${m.user_id}`}>• {m.full_name} có on-time rate thấp ({m.on_time_rate}%)</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
