'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
    Calendar,
    Filter,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    RefreshCw,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface GanttTask {
    id: string;
    title: string;
    status: string;
    start_date: string;
    end_date: string;
    progress: number;
    assignee_name: string;
    assignee_id: string;
}

export default function GanttFiltersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<GanttTask[]>([]);
    const [projectName, setProjectName] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [scale, setScale] = useState<'day' | 'week' | 'month'>('week');

    // Members list for filter
    const [members, setMembers] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-09-03/04
            const mockTasks: GanttTask[] = [
                { id: 't1', title: 'Setup Project Structure', status: 'DONE', start_date: '2025-01-01', end_date: '2025-01-05', progress: 100, assignee_name: 'Nguyễn Văn A', assignee_id: 'u1' },
                { id: 't2', title: 'Database Design', status: 'DONE', start_date: '2025-01-03', end_date: '2025-01-10', progress: 100, assignee_name: 'Trần Thị B', assignee_id: 'u2' },
                { id: 't3', title: 'Authentication Module', status: 'IN_PROGRESS', start_date: '2025-01-08', end_date: '2025-01-20', progress: 60, assignee_name: 'Nguyễn Văn A', assignee_id: 'u1' },
                { id: 't4', title: 'Dashboard UI', status: 'IN_PROGRESS', start_date: '2025-01-12', end_date: '2025-01-25', progress: 40, assignee_name: 'Lê Văn C', assignee_id: 'u3' },
                { id: 't5', title: 'Task Management', status: 'TODO', start_date: '2025-01-18', end_date: '2025-02-05', progress: 0, assignee_name: 'Phạm Thị D', assignee_id: 'u4' },
                { id: 't6', title: 'Reports Module', status: 'TODO', start_date: '2025-01-25', end_date: '2025-02-15', progress: 0, assignee_name: 'Trần Thị B', assignee_id: 'u2' },
                { id: 't7', title: 'Testing & QA', status: 'TODO', start_date: '2025-02-10', end_date: '2025-02-20', progress: 0, assignee_name: 'Hoàng Văn E', assignee_id: 'u5' },
            ];

            const mockMembers = [
                { id: 'u1', name: 'Nguyễn Văn A' },
                { id: 'u2', name: 'Trần Thị B' },
                { id: 'u3', name: 'Lê Văn C' },
                { id: 'u4', name: 'Phạm Thị D' },
                { id: 'u5', name: 'Hoàng Văn E' },
            ];

            setTasks(mockTasks);
            setMembers(mockMembers);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchAssignee = assigneeFilter === 'ALL' || t.assignee_id === assigneeFilter;
        return matchStatus && matchAssignee;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DONE': return 'bg-emerald-500';
            case 'IN_PROGRESS': return 'bg-blue-500';
            case 'TODO': return 'bg-slate-300';
            default: return 'bg-slate-300';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'TODO': return <Badge variant="outline">Todo</Badge>;
            case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
            case 'DONE': return <Badge className="bg-emerald-100 text-emerald-700">Done</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Simple Gantt bar calculation
    const getGanttBar = (task: GanttTask) => {
        const projectStart = new Date('2025-01-01');
        const projectEnd = new Date('2025-02-28');
        const totalDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);

        const taskStart = new Date(task.start_date);
        const taskEnd = new Date(task.end_date);

        const startOffset = ((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
        const width = ((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;

        return { left: `${startOffset}%`, width: `${width}%` };
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="gantt-filters-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/gantt`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại Gantt
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <BarChart3 className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Gantt Filter View
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Lọc và xem biểu đồ Gantt (US-MNG-09-03/04)
                            </p>
                        </div>
                        <Button variant="outline" onClick={fetchData} data-testid="btn-refresh">
                            <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="filters-card">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">Bộ lọc:</span>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]" data-testid="filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="TODO">Todo</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                                <SelectTrigger className="w-[180px]" data-testid="filter-assignee">
                                    <SelectValue placeholder="Người thực hiện" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    {members.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={scale} onValueChange={(v) => setScale(v as any)}>
                                <SelectTrigger className="w-[120px]" data-testid="filter-scale">
                                    <SelectValue placeholder="Scale" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Ngày</SelectItem>
                                    <SelectItem value="week">Tuần</SelectItem>
                                    <SelectItem value="month">Tháng</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setStatusFilter('ALL'); setAssigneeFilter('ALL'); }}
                                data-testid="btn-clear-filters"
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Gantt Chart */}
                <Card className="border-none shadow-sm" data-testid="gantt-chart-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Biểu đồ Gantt</CardTitle>
                        <CardDescription>
                            Hiển thị {filteredTasks.length} / {tasks.length} tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            <div className="divide-y divide-slate-100" data-testid="gantt-rows">
                                {/* Header */}
                                <div className="flex items-center bg-slate-50 px-4 py-2">
                                    <div className="w-64 shrink-0 font-bold text-sm text-slate-600">Task</div>
                                    <div className="flex-1 font-bold text-sm text-slate-600 text-center">Timeline (Jan - Feb 2025)</div>
                                </div>

                                {/* Rows */}
                                {filteredTasks.map(task => {
                                    const barStyle = getGanttBar(task);
                                    return (
                                        <div
                                            key={task.id}
                                            className="flex items-center px-4 py-3 hover:bg-slate-50/50"
                                            data-testid={`gantt-row-${task.id}`}
                                        >
                                            <div className="w-64 shrink-0">
                                                <p className="font-medium text-slate-900 truncate" data-testid={`task-title-${task.id}`}>
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusBadge(task.status)}
                                                    <span className="text-xs text-slate-400">{task.assignee_name}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative h-8">
                                                <div className="absolute inset-0 bg-slate-100 rounded-full" />
                                                <div
                                                    className={`absolute h-full rounded-full ${getStatusColor(task.status)} transition-all`}
                                                    style={barStyle}
                                                    data-testid={`gantt-bar-${task.id}`}
                                                >
                                                    {task.progress > 0 && (
                                                        <div
                                                            className="h-full bg-white/30 rounded-full"
                                                            style={{ width: `${task.progress}%` }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-state">
                                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không có task phù hợp với bộ lọc</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Legend */}
                <Card className="border-none shadow-sm" data-testid="legend-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-8 bg-slate-300 rounded" />
                                <span className="text-sm text-slate-600">Todo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-8 bg-blue-500 rounded" />
                                <span className="text-sm text-slate-600">In Progress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-8 bg-emerald-500 rounded" />
                                <span className="text-sm text-slate-600">Done</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
