'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search, Filter, Plus, Calendar,
    User, CheckCircle2, Clock, AlertCircle, ChevronUp, ChevronDown, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function ProjectTasksPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user, hasPermission } = useAuthStore();
    const { tasks, loading, fetchProjectTasks, reorderTask } = useTaskStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    useEffect(() => {
        if (user && projectId) {
            fetchProjectTasks(projectId, user.id);
        }
    }, [projectId, user]);

    const handleReorder = async (taskId: string, direction: 'UP' | 'DOWN') => {
        if (!user) return;
        await reorderTask(taskId, user.id, direction);
        fetchProjectTasks(projectId, user.id); // Refresh list after reorder
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || task.status_code === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.PROJECT_READ} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-500" data-testid="project-tasks-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900" data-testid="project-tasks-title">
                                Danh sách công việc
                            </h1>
                            <p className="text-slate-500 text-sm mt-1 font-medium">
                                Quản lý, theo dõi và phân công nhiệm vụ trong dự án (US-MNG-01-01)
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasPermission(PERMISSIONS.PROJECT_UPDATE) && (
                                <Link href={`/projects/${projectId}/settings/custom-fields`}>
                                    <Button variant="outline" size="sm" className="font-bold border-slate-200" data-testid="btn-custom-fields">
                                        Cấu hình trường
                                    </Button>
                                </Link>
                            )}
                            {hasPermission(PERMISSIONS.TASK_CREATE) && (
                                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 font-bold" size="sm" asChild data-testid="btn-create-task">
                                    <Link href={`/tasks/new?projectId=${projectId}`}>
                                        <Plus className="mr-2 h-4 w-4" /> Thêm mới Task
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="shadow-sm border-none bg-white p-2" data-testid="project-tasks-filters-card">
                        <CardContent className="p-2 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    placeholder="Tìm kiếm task theo tên, ID..."
                                    className="pl-9 h-11 w-full bg-slate-50 border-none rounded-xl font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    data-testid="project-tasks-input-search"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                <Button
                                    variant={statusFilter === 'TODO' ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'TODO' ? null : 'TODO')}
                                    className="h-9 font-bold border-slate-200 rounded-lg whitespace-nowrap"
                                >
                                    To Do
                                </Button>
                                <Button
                                    variant={statusFilter === 'IN_PROGRESS' ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? null : 'IN_PROGRESS')}
                                    className="h-9 font-bold border-slate-200 rounded-lg whitespace-nowrap"
                                >
                                    In Progress
                                </Button>
                                <Button
                                    variant={statusFilter === 'DONE' ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setStatusFilter(statusFilter === 'DONE' ? null : 'DONE')}
                                    className="h-9 font-bold border-slate-200 rounded-lg whitespace-nowrap"
                                >
                                    Done
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Grid/List */}
                    {loading ? (
                        <div className="space-y-4" data-testid="project-tasks-loading-skeleton">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" data-testid="project-tasks-list">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        <tr>
                                            {hasPermission(PERMISSIONS.PROJECT_UPDATE) && <th className="px-6 py-4 w-12 text-center" data-testid="column-reorder">Xếp</th>}
                                            <th className="px-6 py-4" data-testid="column-id">Mã Task</th>
                                            <th className="px-6 py-4" data-testid="column-title">Tên công việc</th>
                                            <th className="px-6 py-4" data-testid="column-assignees">Người thực hiện</th>
                                            <th className="px-6 py-4" data-testid="column-progress">Tiến độ</th>
                                            <th className="px-6 py-4" data-testid="column-status">Trạng thái</th>
                                            <th className="px-6 py-4" data-testid="column-priority">Ưu tiên</th>
                                            <th className="px-6 py-4" data-testid="column-due-date">Hạn chót</th>
                                            <th className="px-6 py-4 text-right" data-testid="column-actions">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredTasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group" data-testid={`task-row-${task.id}`}>
                                                {hasPermission(PERMISSIONS.PROJECT_UPDATE) && (
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" onClick={() => handleReorder(task.id, 'UP')} className="h-6 w-6" data-testid={`btn-reorder-up-${task.id}`}><ChevronUp size={14} /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleReorder(task.id, 'DOWN')} className="h-6 w-6" data-testid={`btn-reorder-down-${task.id}`}><ChevronDown size={14} /></Button>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 font-mono text-slate-400 text-xs">{task.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{task.title}</span>
                                                        {task.is_locked && <span className="text-[10px] text-rose-500 font-black flex items-center gap-1 uppercase tracking-tighter"><Clock size={10} /> Đã khóa</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex -space-x-2">
                                                        {task.assignees && task.assignees.length > 0 ? (
                                                            task.assignees.slice(0, 3).map((a, idx) => (
                                                                <div key={idx} className="w-8 h-8 rounded-xl bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-700 font-black shadow-sm" title={a.user.full_name}>
                                                                    {a.user.full_name.charAt(0)}
                                                                </div>
                                                            ))
                                                        ) : <span className="text-slate-300 font-medium italic text-xs">Chưa phân công</span>}
                                                        {task.assignees && task.assignees.length > 3 && (
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold shadow-sm">
                                                                +{task.assignees.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 w-24">
                                                        <div className="flex justify-between text-[10px] font-black text-slate-400">
                                                            <span>{task.subtasks?.length ? Math.round((task.subtasks.filter(s => s.status_code === 'DONE').length / task.subtasks.length) * 100) : (task.status_code === 'DONE' ? 100 : 0)}%</span>
                                                        </div>
                                                        <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden w-full">
                                                            <div
                                                                className={cn("h-full transition-all duration-500", task.status_code === 'DONE' ? "bg-emerald-500" : "bg-blue-500")}
                                                                style={{ width: `${task.subtasks?.length ? (task.subtasks.filter(s => s.status_code === 'DONE').length / task.subtasks.length) * 100 : (task.status_code === 'DONE' ? 100 : 0)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={cn(
                                                        "rounded-lg font-bold text-[10px] uppercase px-2 py-0.5",
                                                        task.status_code === 'DONE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                            task.status_code === 'IN_PROGRESS' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                                    )} data-testid={`task-status-${task.id}`}>
                                                        {task.status_code}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className={cn(
                                                        "rounded-lg font-bold text-[10px] uppercase px-2 py-0.5",
                                                        task.priority_code === 'URGENT' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                            task.priority_code === 'HIGH' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                                    )}>
                                                        {task.priority_code}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-bold">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3 text-slate-300" /> {task.due_date || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="ghost" className="rounded-xl font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild data-testid={`btn-view-task-${task.id}`}>
                                                        <Link href={`/tasks/${task.id}`}>Chi tiết</Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredTasks.length === 0 && (
                                <div className="p-20 text-center text-slate-300" data-testid="project-tasks-empty-state">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="font-bold text-lg">Không tìm thấy công việc nào.</p>
                                    <p className="text-sm font-medium">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}
