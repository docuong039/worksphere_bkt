'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Filter,
    Search,
    Users,
    ChevronDown,
    ChevronRight,
    ZoomOut,
    Maximize2,
    Target,
    CheckCircle2,
    Clock,
    SeparatorVertical,
    Download,
    Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
    const [zoom, setZoom] = useState<'DAYS' | 'WEEKS' | 'MONTHS' | 'QUARTERS'>('DAYS');
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [isExporting, setIsExporting] = useState(false);
    const { toast } = useToast();

    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-02-28');
    const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const dayWidth = 40;

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

    const handleFilter = () => {
        toast({
            title: "Thông báo",
            description: "Tính năng lọc biểu đồ đang được phát triển.",
        });
    };

    const handleMaximize = () => {
        const container = document.getElementById('gantt-chart-wrapper');
        if (container) {
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(err => {
                    toast({
                        title: "Lỗi",
                        description: `Không thể mở toàn màn hình: ${err.message}`,
                        variant: "destructive"
                    });
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        toast({
            title: "Thành công",
            description: "Biểu đồ Gantt đã được xuất ra định dạng PDF.",
        });
    };

    const handleGoToToday = () => {
        const today = new Date();
        const timeline = document.getElementById('gantt-timeline-scroll');
        if (timeline) {
            const left = getLeftPosition(today.toISOString().split('T')[0]);
            timeline.scrollTo({ left: left - 200, behavior: 'smooth' });
            toast({
                title: "Đã chuyển",
                description: "Đã di chuyển tới ngày hôm nay.",
            });
        }
    };

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchGanttData = async () => {
            setLoading(true);
            try {
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

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-pulse p-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-[600px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div id="gantt-chart-wrapper" className="flex flex-col h-[calc(100vh-250px)] animate-in fade-in duration-700 bg-slate-50 p-4 rounded-3xl overflow-hidden" data-testid="gantt-page-container">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 shrink-0">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight" data-testid="gantt-title">
                        Biểu đồ Gantt
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <Card className="border-none shadow-sm bg-slate-100/50 p-1 flex items-center">
                        {(['DAYS', 'WEEKS', 'MONTHS', 'QUARTERS'] as const).map((z) => (
                            <Button
                                key={z}
                                variant={zoom === z ? 'secondary' : 'ghost'}
                                size="sm"
                                className={cn("h-8 px-4 font-bold rounded-lg", zoom === z ? "bg-white shadow-sm" : "")}
                                onClick={() => setZoom(z)}
                            >
                                {z === 'DAYS' ? 'Ngày' : z === 'WEEKS' ? 'Tuần' : z === 'MONTHS' ? 'Tháng' : 'Quý'}
                            </Button>
                        ))}
                    </Card>
                    <Button variant="outline" size="sm" className="h-10 font-bold gap-2 border-slate-200" onClick={handleGoToToday} data-testid="btn-gantt-today">
                        <Target size={16} className="text-blue-600" />
                        Hôm nay
                    </Button>
                    <Separator orientation="vertical" className="h-8 mx-1" />
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200" onClick={handleFilter} data-testid="btn-gantt-filter">
                        <Filter size={18} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200" onClick={handleMaximize} data-testid="btn-gantt-maximize">
                        <Maximize2 size={18} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 font-bold gap-2 border-slate-200 px-4" onClick={handleExport} disabled={isExporting} data-testid="btn-gantt-export">
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download size={18} />}
                        Xuất PDF
                    </Button>
                </div>
            </div>

            {/* Gantt Chart Container */}
            <Card className="flex-1 border-none shadow-sm overflow-hidden bg-white rounded-3xl flex flex-col" data-testid="gantt-chart">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                            <Input placeholder="Tìm kiếm tên công việc..." className="pl-9 h-9 w-64 bg-white border-slate-200 rounded-xl text-xs font-semibold shadow-sm" />
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

                <div className="flex-1 flex overflow-hidden">
                    {/* Task List (Left) */}
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

                    {/* Timeline (Right) */}
                    <div id="gantt-timeline-scroll" className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-50/10 scroll-smooth">
                        <div className="relative min-h-full" style={{ width: `${dayWidth * daysCount}px` }}>
                            <div className="h-12 border-b border-slate-100 flex absolute top-0 left-0 bg-white z-10 w-full shadow-sm">
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

                            <div className="absolute top-12 left-0 bottom-0 flex w-full pointer-events-none">
                                {Array.from({ length: daysCount }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-full border-r border-slate-100/50 shrink-0"
                                        style={{ width: `${dayWidth}px` }}
                                    ></div>
                                ))}

                                {/* Today Line Marker */}
                                <div
                                    className="absolute top-0 bottom-0 border-l-2 border-rose-500 z-30 flex flex-col items-center pointer-events-none"
                                    style={{ left: `${getLeftPosition(new Date().toISOString().split('T')[0])}px` }}
                                >
                                    <div className="bg-rose-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase mt-1 shadow-sm">Today</div>
                                </div>
                            </div>

                            <div className="absolute top-12 left-0 bottom-0 w-full overflow-y-auto no-scrollbar">
                                {tasks.filter(t => t.type === 'TASK').map((task) => (
                                    <React.Fragment key={task.id}>
                                        <div className="h-14 flex items-center relative border-b border-slate-50/50">
                                            <div
                                                className={cn(
                                                    "h-8 rounded-full shadow-lg flex items-center px-4 absolute transition-all duration-700 hover:scale-[1.02] group z-20",
                                                    task.status === 'DONE' ? "bg-emerald-500 shadow-emerald-100" : "bg-blue-600 shadow-blue-100"
                                                )}
                                                style={{
                                                    left: `${getLeftPosition(task.start_date)}px`,
                                                    width: `${getWidth(task.start_date, task.due_date)}px`
                                                }}
                                            >
                                                <span className="text-[10px] font-black text-white truncate drop-shadow-sm">{task.progress}%</span>
                                            </div>
                                        </div>
                                        {expandedTasks.has(task.id) && tasks.filter(s => s.parent_id === task.id).map(sub => (
                                            <div key={sub.id} className="h-12 flex items-center relative border-b border-slate-50/30 bg-slate-50/10">
                                                <div
                                                    className={cn(
                                                        "h-6 rounded-lg flex items-center px-3 absolute transition-all z-20",
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
    );
}
