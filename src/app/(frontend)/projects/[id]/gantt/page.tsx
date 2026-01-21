'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Calendar,
    Filter,
    Search,
    Users,
    ChevronDown,
    ChevronRight,
    Loader2,
    ZoomIn,
    ZoomOut,
    Maximize2,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface GanttTask {
    id: string;
    title: string;
    start_date: string;
    due_date: string;
    status: string;
    assignee_name: string;
    type: 'TASK' | 'SUBTASK';
    parent_id?: string;
    progress: number;
}

export default function GanttPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<GanttTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState<'DAYS' | 'WEEKS' | 'MONTHS'>('DAYS');
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchGanttData = async () => {
            setLoading(true);
            try {
                // Mock fetching Gantt data
                // In a real app, this would be an API call
                const res = await fetch(`/api/projects/${id}/gantt`, {
                    headers: {
                        'x-user-id': user?.id || '',
                        'x-user-role': user?.role || ''
                    }
                });
                const data = await res.json();
                setTasks(data.tasks || []);
            } catch (error) {
                console.error(error);
                // Mock data for Gantt
                setTasks([
                    { id: 't1', title: 'Phase 1: Research', start_date: '2026-01-01', due_date: '2026-01-10', status: 'DONE', assignee_name: 'John Doe', type: 'TASK', progress: 100 },
                    { id: 's1', title: 'Market Analysis', start_date: '2026-01-02', due_date: '2026-01-05', status: 'DONE', assignee_name: 'Alice', type: 'SUBTASK', parent_id: 't1', progress: 100 },
                    { id: 's2', title: 'User Interviews', start_date: '2026-01-05', due_date: '2026-01-10', status: 'DONE', assignee_name: 'Bob', type: 'SUBTASK', parent_id: 't1', progress: 100 },
                    { id: 't2', title: 'Phase 2: UI Design', start_date: '2026-01-11', due_date: '2026-01-25', status: 'IN_PROGRESS', assignee_name: 'Sarah', type: 'TASK', progress: 45 },
                    { id: 's3', title: 'Wireframes', start_date: '2026-01-11', due_date: '2026-01-18', status: 'DONE', assignee_name: 'Sarah', type: 'SUBTASK', parent_id: 't2', progress: 100 },
                    { id: 's4', title: 'Hi-Fi Mockups', start_date: '2026-01-19', due_date: '2026-01-25', status: 'TODO', assignee_name: 'Sarah', type: 'SUBTASK', parent_id: 't2', progress: 0 },
                    { id: 't3', title: 'Phase 3: Development', start_date: '2026-01-26', due_date: '2026-02-15', status: 'TODO', assignee_name: 'Dev Team', type: 'TASK', progress: 0 }
                ]);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchGanttData();
    }, [id, user]);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedTasks);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedTasks(newSet);
    };

    // Gantt Timeline logic
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-02-28');
    const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    const dayWidth = 40; // px per day
    const weekWidth = dayWidth * 7;
    const monthWidth = dayWidth * 30;

    const getLeftPosition = (dateStr: string) => {
        const date = new Date(dateStr);
        const diff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
        return diff * dayWidth;
    };

    const getWidth = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        return diff * dayWidth;
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-[600px] w-full rounded-2xl" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto pb-10 flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-700" data-testid="gantt-page-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div className="space-y-1">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 h-8">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="gantt-title">
                            Biểu đồ Gantt Dự án
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Card className="border-none shadow-sm bg-slate-100/50 p-1 flex items-center">
                            <Button
                                variant={zoom === 'DAYS' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 px-4 font-bold rounded-lg data-[state=active]:bg-white"
                                onClick={() => setZoom('DAYS')}
                                data-testid="zoom-days"
                            >
                                Ngày
                            </Button>
                            <Button
                                variant={zoom === 'WEEKS' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 px-4 font-bold rounded-lg"
                                onClick={() => setZoom('WEEKS')}
                                data-testid="zoom-weeks"
                            >
                                Tuần
                            </Button>
                            <Button
                                variant={zoom === 'MONTHS' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 px-4 font-bold rounded-lg"
                                onClick={() => setZoom('MONTHS')}
                                data-testid="zoom-months"
                            >
                                Tháng
                            </Button>
                        </Card>
                        <Separator orientation="vertical" className="h-8 mx-2" />
                        <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
                            <Filter size={18} />
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200">
                            <Maximize2 size={18} />
                        </Button>
                    </div>
                </div>

                {/* Gantt Container */}
                <Card className="flex-1 border-none shadow-2xl overflow-hidden bg-white rounded-3xl flex flex-col" data-testid="gantt-chart">
                    {/* Gantt Toolbar Inner */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                                <Input placeholder="Tìm kiếm tên công việc..." className="pl-9 h-9 w-64 bg-white border-slate-200 rounded-xl text-xs font-semibold" />
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Công việc</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoàn thành</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gantt View Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Task List (Left Side) */}
                        <div className="w-80 border-r border-slate-100 flex flex-col shrink-0">
                            <div className="h-12 border-b border-slate-100 flex items-center px-6 bg-slate-50/50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cấu trúc công việc</span>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {tasks.filter(t => t.type === 'TASK').map(task => (
                                    <React.Fragment key={task.id}>
                                        <div
                                            className="h-14 flex items-center px-4 hover:bg-slate-50 group cursor-pointer border-b border-slate-50/50"
                                            onClick={() => toggleExpand(task.id)}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center text-slate-400">
                                                {expandedTasks.has(task.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                            <div className="flex flex-col truncate ml-1">
                                                <span className="text-xs font-black text-slate-900 truncate">{task.title}</span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{task.assignee_name}</span>
                                            </div>
                                        </div>
                                        {expandedTasks.has(task.id) && tasks.filter(s => s.parent_id === task.id).map(sub => (
                                            <div key={sub.id} className="h-12 flex items-center pl-10 pr-4 hover:bg-slate-50/50 border-b border-slate-50/30">
                                                <div className="flex flex-col truncate">
                                                    <span className="text-xs font-bold text-slate-600 truncate">{sub.title}</span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{sub.assignee_name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Timeline (Right Side) */}
                        <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/10">
                            <div className="relative min-h-full" style={{ width: `${dayWidth * daysCount}px` }}>
                                {/* Timeline Header */}
                                <div className="h-12 border-b border-slate-100 flex absolute top-0 left-0 bg-white z-10 w-full">
                                    {Array.from({ length: daysCount }).map((_, i) => {
                                        const date = new Date(startDate);
                                        date.setDate(date.getDate() + i);
                                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                        return (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-full border-r border-slate-100 flex flex-col items-center justify-center shrink-0",
                                                    isWeekend ? "bg-slate-50/50" : ""
                                                )}
                                                style={{ width: `${dayWidth}px` }}
                                            >
                                                <span className="text-[8px] font-black text-slate-400 uppercase">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}</span>
                                                <span className="text-[10px] font-black text-slate-900">{date.getDate()}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Main Grid Vertical Lines */}
                                <div className="absolute top-12 left-0 bottom-0 flex w-full">
                                    {Array.from({ length: daysCount }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-full border-r border-slate-100/50 shrink-0"
                                            style={{ width: `${dayWidth}px` }}
                                        ></div>
                                    ))}
                                </div>

                                {/* Task Bars Overlay */}
                                <div className="absolute top-12 left-0 bottom-0 w-full overflow-y-auto pt-0 no-scrollbar">
                                    {tasks.filter(t => t.type === 'TASK').map((task, idx) => (
                                        <React.Fragment key={task.id}>
                                            <div className="h-14 flex items-center relative border-b border-slate-50/50">
                                                <div
                                                    className={cn(
                                                        "h-8 rounded-full shadow-lg flex items-center px-4 absolute transition-all duration-700 hover:scale-[1.02] group",
                                                        task.status === 'DONE' ? "bg-emerald-500 shadow-emerald-100" : "bg-blue-600 shadow-blue-100"
                                                    )}
                                                    style={{
                                                        left: `${getLeftPosition(task.start_date)}px`,
                                                        width: `${getWidth(task.start_date, task.due_date)}px`
                                                    }}
                                                    data-testid={`gantt-bar-${task.id}`}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                                                    <span className="text-[10px] font-black text-white truncate drop-shadow-sm">{task.progress}%</span>
                                                    <div className="absolute right-[-24px] pointer-events-none">
                                                        {task.status === 'DONE' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                        {task.status === 'IN_PROGRESS' && <Clock size={14} className="text-blue-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                            {expandedTasks.has(task.id) && tasks.filter(s => s.parent_id === task.id).map(sub => (
                                                <div key={sub.id} className="h-12 flex items-center relative border-b border-slate-50/30 bg-slate-50/10">
                                                    <div className="absolute left-0 right-0 h-full pointer-events-none flex items-center">
                                                        <div className="h-[2px] w-4 border-l-2 border-b-2 border-slate-200 ml-5 -mt-6"></div>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "h-6 rounded-lg flex items-center px-3 absolute transition-all",
                                                            sub.status === 'DONE' ? "bg-emerald-400" : "bg-blue-400"
                                                        )}
                                                        style={{
                                                            left: `${getLeftPosition(sub.start_date)}px`,
                                                            width: `${getWidth(sub.start_date, sub.due_date)}px`
                                                        }}
                                                    >
                                                        <span className="text-[8px] font-bold text-white truncate">{sub.title}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="h-10 border-t border-slate-100 flex items-center px-6 bg-slate-50/50 justify-between shrink-0">
                        <div className="flex gap-4">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bắt đầu: 01/01/2026</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kết thúc: 28/02/2026</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Users size={10} /> 5 Người thực hiện
                            </span>
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10} /> 3 Giai đoạn
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
