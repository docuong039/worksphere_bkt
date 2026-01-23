'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Crown,
    TrendingUp,
    TrendingDown,
    Users,
    FolderKanban,
    Clock,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Activity,
    RefreshCw,
    ArrowUpRight,
    BarChart3,
    Target,
    Zap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ExecutiveStats {
    total_employees: number;
    employees_change: number;
    active_projects: number;
    projects_change: number;
    monthly_cost: number;
    cost_change: number;
    avg_productivity: number;
    productivity_change: number;
    overdue_tasks: number;
    blocked_tasks: number;
    total_tasks: number;
    completed_tasks: number;
}

interface ProjectOverview {
    id: string;
    name: string;
    code: string;
    status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED';
    completion_rate: number;
    total_tasks: number;
    overdue_tasks: number;
    pm_name: string;
    monthly_cost: number;
}

interface TopPerformer {
    id: string;
    name: string;
    role: string;
    tasks_completed: number;
    hours_logged: number;
    on_time_rate: number;
}

export default function ExecutiveDashboardPage() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<ExecutiveStats | null>(null);
    const [projects, setProjects] = useState<ProjectOverview[]>([]);
    const [performers, setPerformers] = useState<TopPerformer[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('month');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-01-01
            const mockStats: ExecutiveStats = {
                total_employees: 85,
                employees_change: 12,
                active_projects: 12,
                projects_change: 2,
                monthly_cost: 1250000000,
                cost_change: 8,
                avg_productivity: 87,
                productivity_change: 5,
                overdue_tasks: 15,
                blocked_tasks: 8,
                total_tasks: 450,
                completed_tasks: 312,
            };

            const mockProjects: ProjectOverview[] = [
                { id: 'p1', name: 'Worksphere Platform', code: 'WSP', status: 'ON_TRACK', completion_rate: 75, total_tasks: 120, overdue_tasks: 3, pm_name: 'Lê Văn PM', monthly_cost: 250000000 },
                { id: 'p2', name: 'Mobile App Revamp', code: 'MAR', status: 'AT_RISK', completion_rate: 45, total_tasks: 80, overdue_tasks: 8, pm_name: 'Trần Thị Manager', monthly_cost: 180000000 },
                { id: 'p3', name: 'Data Analytics Suite', code: 'DAS', status: 'DELAYED', completion_rate: 30, total_tasks: 60, overdue_tasks: 12, pm_name: 'Nguyễn Văn PM', monthly_cost: 150000000 },
                { id: 'p4', name: 'API Gateway', code: 'APG', status: 'ON_TRACK', completion_rate: 90, total_tasks: 45, overdue_tasks: 0, pm_name: 'Phạm Thị Lead', monthly_cost: 120000000 },
            ];

            const mockPerformers: TopPerformer[] = [
                { id: 'u1', name: 'Nguyễn Văn A', role: 'Senior Developer', tasks_completed: 45, hours_logged: 168, on_time_rate: 95 },
                { id: 'u2', name: 'Trần Thị B', role: 'UI/UX Designer', tasks_completed: 38, hours_logged: 152, on_time_rate: 92 },
                { id: 'u3', name: 'Lê Văn C', role: 'QA Engineer', tasks_completed: 52, hours_logged: 160, on_time_rate: 88 },
                { id: 'u4', name: 'Phạm Văn D', role: 'Backend Developer', tasks_completed: 40, hours_logged: 165, on_time_rate: 90 },
            ];

            setStats(mockStats);
            setProjects(mockProjects);
            setPerformers(mockPerformers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value);
    };

    const getProjectStatusBadge = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return <Badge className="bg-emerald-100 text-emerald-700">Đúng tiến độ</Badge>;
            case 'AT_RISK': return <Badge className="bg-amber-100 text-amber-700">Có rủi ro</Badge>;
            case 'DELAYED': return <Badge className="bg-red-100 text-red-700">Trễ hạn</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const completionRate = stats ? (stats.completed_tasks / stats.total_tasks) * 100 : 0;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="executive-dashboard-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="dashboard-page-title">
                            <Crown className="inline-block mr-3 h-8 w-8 text-amber-500" />
                            Executive Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Tổng quan chiến lược tổ chức (US-CEO-01-01)
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]" data-testid="dashboard-select-time-range">
                                <SelectValue placeholder="Thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Tuần này</SelectItem>
                                <SelectItem value="month">Tháng này</SelectItem>
                                <SelectItem value="quarter">Quý này</SelectItem>
                                <SelectItem value="year">Năm nay</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={fetchDashboardData} data-testid="dashboard-btn-refresh">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="dashboard-loading-skeleton">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} className="h-36 w-full" />
                        ))}
                    </div>
                ) : stats && (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50" data-testid="stat-employees">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <Badge className={stats.employees_change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                            {stats.employees_change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                            {Math.abs(stats.employees_change)}%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Tổng nhân sự</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.total_employees}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50" data-testid="dashboard-stat-projects">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <FolderKanban className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" />+{stats.projects_change}
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Dự án đang chạy</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.active_projects}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50" data-testid="stat-cost">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <Badge className={stats.cost_change <= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                            <TrendingUp className="h-3 w-3 mr-1" />+{stats.cost_change}%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Chi phí tháng</p>
                                        <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.monthly_cost)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-orange-50" data-testid="stat-productivity">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-amber-600" />
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            <TrendingUp className="h-3 w-3 mr-1" />+{stats.productivity_change}%
                                        </Badge>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm text-slate-500 font-medium">Năng suất TB</p>
                                        <p className="text-3xl font-bold text-slate-900">{stats.avg_productivity}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Alert Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-none shadow-sm border-l-4 border-l-red-500" data-testid="alert-overdue">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500">Tasks trễ hạn</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.overdue_tasks}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600" data-testid="btn-view-overdue">
                                        Xem <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm border-l-4 border-l-amber-500" data-testid="alert-blocked">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500">Tasks bị chặn</p>
                                        <p className="text-2xl font-bold text-amber-600">{stats.blocked_tasks}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-amber-600" data-testid="btn-view-blocked">
                                        Xem <ArrowUpRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm border-l-4 border-l-emerald-500" data-testid="alert-completion">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Target className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500">Tỷ lệ hoàn thành</p>
                                        <p className="text-2xl font-bold text-emerald-600">{completionRate.toFixed(0)}%</p>
                                    </div>
                                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Projects + Performers */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Projects Overview */}
                            <Card className="border-none shadow-sm lg:col-span-2" data-testid="projects-overview-card">
                                <CardHeader className="border-b border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">Tình hình dự án</CardTitle>
                                            <CardDescription>Theo dõi tiến độ các dự án</CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" data-testid="btn-view-all-projects">
                                            Xem tất cả <ArrowUpRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table data-testid="projects-table">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="font-bold">Dự án</TableHead>
                                                <TableHead className="font-bold">Trạng thái</TableHead>
                                                <TableHead className="font-bold">Tiến độ</TableHead>
                                                <TableHead className="font-bold text-right">Chi phí</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {projects.map(project => (
                                                <TableRow key={project.id} data-testid={`project-row-${project.id}`}>
                                                    <TableCell>
                                                        <Link href={`/projects/${project.id}/overview`} className="hover:text-blue-600 transition-colors">
                                                            <p className="font-bold">{project.name}</p>
                                                            <p className="text-xs text-slate-400 font-medium">PM: {project.pm_name}</p>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{getProjectStatusBadge(project.status)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[100px]">
                                                                <div
                                                                    className={`h-full rounded-full ${project.completion_rate >= 70 ? 'bg-emerald-500' : project.completion_rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${project.completion_rate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">{project.completion_rate}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(project.monthly_cost)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Top Performers */}
                            <Card className="border-none shadow-sm" data-testid="performers-card">
                                <CardHeader className="border-b border-slate-100">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        Top Performers
                                    </CardTitle>
                                    <CardDescription>Nhân sự xuất sắc tháng này</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-100" data-testid="performers-list">
                                        {performers.map((performer, index) => (
                                            <div
                                                key={performer.id}
                                                className="p-4 flex items-center gap-4"
                                                data-testid={`performer-${performer.id}`}
                                            >
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                                                            {performer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {index < 3 && (
                                                        <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}`}>
                                                            {index + 1}
                                                        </span>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/hr/employees/${performer.id}`}
                                                    className="flex-1 min-w-0 hover:bg-slate-50 transition-colors rounded-lg p-1 -ml-1"
                                                >
                                                    <p className="font-bold text-sm truncate text-slate-900">{performer.name}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{performer.role}</p>
                                                </Link>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-600">{performer.tasks_completed}</p>
                                                    <p className="text-xs text-slate-400">tasks</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
