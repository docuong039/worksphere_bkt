/**
 * Personal Kanban Page
 * 
 * US-CEO-07-01: CEO manages personal tasks in Kanban format.
 * US-EMP-01-01: EMP views tasks in Kanban.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    MoreHorizontal,
    MessageSquare,
    Paperclip,
    Clock,
    Calendar,
    Filter,
    Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
    priority: string;
    due_date: string;
    project_code: string;
    comments_count: number;
    attachments_count: number;
}

const COLUMNS = [
    { id: 'TODO', title: 'Cần làm', color: 'bg-slate-400' },
    { id: 'IN_PROGRESS', title: 'Đang thực hiện', color: 'bg-blue-500' },
    { id: 'DONE', title: 'Đã hoàn thành', color: 'bg-emerald-500' },
    { id: 'BLOCKED', title: 'Đang bị chặn', color: 'bg-rose-500' },
];

const TaskCard = ({ task }: { task: Task }) => (
    <Card
        className="mb-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing bg-white group"
        data-testid={`kanban-task-card-${task.id}`}
    >
        <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 border-slate-200 text-slate-400 group-hover:text-blue-600 transition-colors" data-testid={`task-project-code-${task.id}`}>
                    {task.project_code}
                </Badge>
                <button className="text-slate-300 hover:text-slate-600" data-testid={`task-menu-btn-${task.id}`}>
                    <MoreHorizontal size={14} />
                </button>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" data-testid={`task-title-${task.id}`}>
                {task.title}
            </h4>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                    {task.comments_count > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400" data-testid={`task-comments-${task.id}`}>
                            <MessageSquare size={12} /> {task.comments_count}
                        </div>
                    )}
                    {task.attachments_count > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400" data-testid={`task-attachments-${task.id}`}>
                            <Paperclip size={12} /> {task.attachments_count}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full" data-testid={`task-due-date-${task.id}`}>
                    <Clock size={10} />
                    {new Date(task.due_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function KanbanPage() {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/tasks?view=kanban', {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                setTasks(data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchTasks();
    }, [user]);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex gap-6 overflow-hidden h-[calc(100vh-200px)]" data-testid="kanban-loading-skeleton">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="w-80 h-full rounded-2xl" />
                    ))}
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6 h-full flex flex-col" data-testid="kanban-page-container">
                <div className="flex items-center justify-between" data-testid="kanban-header">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2" data-testid="kanban-page-title">
                            <Layout className="text-blue-600" />
                            Kanban Công việc
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Kéo thả để cập nhật trạng thái công việc của bạn.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="bg-white" data-testid="kanban-filter-btn">
                            <Filter size={14} className="mr-2" /> Lọc
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="kanban-add-task-btn">
                            <Plus size={14} className="mr-2" /> Công việc mới
                        </Button>
                    </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start" data-testid="kanban-board">
                    {COLUMNS.map(col => (
                        <div
                            key={col.id}
                            className="w-80 shrink-0 flex flex-col h-full bg-slate-50/50 rounded-2xl border border-slate-100/50"
                            data-testid={`kanban-column-${col.id.toLowerCase()}`}
                        >
                            <div className="p-4 flex items-center justify-between" data-testid={`kanban-column-header-${col.id.toLowerCase()}`}>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2.5 h-2.5 rounded-full", col.color)}></div>
                                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{col.title}</h3>
                                    <Badge variant="secondary" className="bg-white text-slate-500 border-none font-bold text-[10px] px-1.5 h-5" data-testid={`kanban-column-count-${col.id.toLowerCase()}`}>
                                        {tasks.filter(t => t.status === col.id).length}
                                    </Badge>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600" data-testid={`kanban-column-add-${col.id.toLowerCase()}`}>
                                    <Plus size={16} />
                                </button>
                            </div>

                            <div className="px-4 pb-4 overflow-y-auto flex-1 custom-scrollbar" data-testid={`kanban-column-tasks-${col.id.toLowerCase()}`}>
                                {tasks
                                    .filter(t => t.status === col.id)
                                    .map(task => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-xs italic" data-testid={`kanban-column-empty-${col.id.toLowerCase()}`}>
                                        Trống
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

