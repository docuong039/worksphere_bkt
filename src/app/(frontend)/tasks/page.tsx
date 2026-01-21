/**
 * Tasks Page
 * 
 * User Stories:
 * - US-EMP-01-01: Xem danh sách task được giao
 * - US-EMP-01-02: Tìm kiếm và lọc task
 * - US-MNG-01-11: PM tìm kiếm và lọc toàn bộ task trong dự án
 * - US-MNG-01-14: PM sắp xếp thứ tự task
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    CheckSquare,
    Calendar,
    Clock,
    AlertCircle,
    ChevronRight,
    Loader2,
    Users,
    LayoutGrid,
    List,
    X,
    Layers,
    ArrowUpRight,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
    project: { id: string; name: string; code: string };
    assignees: { id: string; full_name: string }[];
    subtasks_count: number;
    subtasks_done: number;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
    const config: any = {
        LOW: { color: 'bg-slate-100 text-slate-600', icon: null, label: 'THẤP' },
        MEDIUM: { color: 'bg-blue-50 text-blue-600', icon: null, label: 'TRUNG BÌNH' },
        HIGH: { color: 'bg-amber-50 text-amber-700', icon: ArrowUpRight, label: 'CAO' },
        URGENT: { color: 'bg-rose-50 text-rose-700', icon: AlertCircle, label: 'KHẨN CẤP' },
    };
    const { color, icon: Icon, label } = config[priority] || config.MEDIUM;

    return (
        <Badge variant="secondary" className={cn("border-none px-2 py-0 h-5 font-bold text-[10px] tracking-tight", color)}>
            {Icon && <Icon size={10} className="mr-1" />}
            {label}
        </Badge>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        TODO: { color: 'bg-slate-100 text-slate-500', label: 'CHỜ XỬ LÝ' },
        IN_PROGRESS: { color: 'bg-blue-600 text-white', label: 'ĐANG LÀM' },
        DONE: { color: 'bg-emerald-500 text-white', label: 'HOÀN THÀNH' },
        BLOCKED: { color: 'bg-rose-600 text-white', label: 'BỊ CHẶN' },
    };
    const { color, label } = config[status] || config.TODO;

    return (
        <Badge className={cn("border-none px-2 py-0.5 font-bold text-[10px]", color)}>
            {label}
        </Badge>
    );
};

const TaskCard = ({ task }: { task: Task }) => {
    const progress = task.subtasks_count > 0
        ? Math.round((task.subtasks_done / task.subtasks_count) * 100)
        : (task.status === 'DONE' ? 100 : 0);

    return (
        <Card
            className="group hover:shadow-md transition-all duration-300 border border-slate-100 shadow-sm bg-white overflow-hidden"
            data-testid={`task-card-${task.id}`}
        >
            <CardContent className="p-0">
                <Link href={`/tasks/${task.id}`} className="block p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-2">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.project.code}</span>
                    </div>

                    <h3 className={cn(
                        "text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-4",
                        task.status === 'DONE' && "text-slate-400 line-through"
                    )}>
                        {task.title}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                <Calendar size={14} className="text-slate-400" />
                                {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'No date'}
                            </div>
                            {task.subtasks_count > 0 && (
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                    <Layers size={14} className="text-slate-400" />
                                    {task.subtasks_done}/{task.subtasks_count}
                                </div>
                            )}
                        </div>

                        <div className="flex -space-x-2">
                            {task.assignees.map((a, i) => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100">
                                    {a.full_name.charAt(0)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                            <span>Progress</span>
                            <span className="text-slate-700">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-700",
                                    task.status === 'DONE' ? "bg-emerald-500" : "bg-blue-500"
                                )}
                                style={{ width: `${progress}%` }}
                                data-testid={`task-progress-${task.id}`}
                            ></div>
                        </div>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
};

export default function TasksPage() {
    const { user } = useAuthStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
            if (priorityFilter !== 'ALL') queryParams.append('priority', priorityFilter);
            if (searchQuery) queryParams.append('search', searchQuery);

            const res = await fetch(`/api/tasks?${queryParams.toString()}`, {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            setTasks(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
        }
    }, [user, statusFilter, priorityFilter]);

    // Handle search with local filter for better responsiveness, then fetch on enter or button
    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700" data-testid="tasks-page-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="tasks-page-title">
                            Công việc của tôi
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Theo dõi các nhiệm vụ và duy trì hiệu suất làm việc.
                        </p>
                    </div>
                    {user?.role === 'PROJECT_MANAGER' && (
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" data-testid="create-task-button" asChild>
                            <Link href="/tasks/new">
                                <Plus className="mr-2 h-4 w-4" /> Tạo công việc
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div className="relative group w-full sm:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <Input
                                placeholder="Tìm kiếm công việc..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
                                className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all rounded-lg"
                                data-testid="task-search-input"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-10 border-slate-200" data-testid="status-filter-trigger">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="TODO">Chờ xử lý</SelectItem>
                                    <SelectItem value="IN_PROGRESS">Đang làm</SelectItem>
                                    <SelectItem value="DONE">Hoàn thành</SelectItem>
                                    <SelectItem value="BLOCKED">Bị chặn</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-[140px] h-10 border-slate-200" data-testid="priority-filter-trigger">
                                    <SelectValue placeholder="Độ ưu tiên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="LOW">Thấp</SelectItem>
                                    <SelectItem value="MEDIUM">Trung bình</SelectItem>
                                    <SelectItem value="HIGH">Cao</SelectItem>
                                    <SelectItem value="URGENT">Khẩn cấp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(statusFilter !== 'ALL' || priorityFilter !== 'ALL' || searchQuery) && (
                        <div className="flex items-center gap-2 flex-wrap" data-testid="active-filters">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Đang lọc:</span>
                            {searchQuery && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 gap-1 pr-1 border-blue-100">
                                    "{searchQuery}"
                                    <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                </Badge>
                            )}
                            {statusFilter !== 'ALL' && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 gap-1 pr-1 border-blue-100">
                                    Trạng thái: {statusFilter}
                                    <X size={12} className="cursor-pointer" onClick={() => setStatusFilter('ALL')} />
                                </Badge>
                            )}
                            {priorityFilter !== 'ALL' && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 gap-1 pr-1 border-blue-100">
                                    Ưu tiên: {priorityFilter}
                                    <X size={12} className="cursor-pointer" onClick={() => setPriorityFilter('ALL')} />
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('ALL');
                                    setPriorityFilter('ALL');
                                }}
                            >
                                Xóa tất cả
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 border-l border-slate-100 pl-4 h-8 self-end lg:self-center">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                            data-testid="btn-view-grid"
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('list')}
                            data-testid="btn-view-list"
                        >
                            <List size={16} />
                        </Button>
                    </div>
                </div>

                {/* Tasks Content */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Card key={i} className="border border-slate-100 shadow-sm h-48">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-12" />
                                        <Skeleton className="h-4 w-12" />
                                    </div>
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-2/3" />
                                    <div className="flex justify-between pt-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredTasks.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="tasks-grid">
                            {filteredTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-none shadow-sm overflow-hidden bg-white">
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100" data-testid="tasks-list">
                                    {filteredTasks.map((task) => (
                                        <Link
                                            key={task.id}
                                            href={`/tasks/${task.id}`}
                                            className="p-4 hover:bg-slate-50 flex items-center gap-6 transition-colors group"
                                        >
                                            <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-transparent group-hover:border-blue-500">
                                                <CheckSquare size={12} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate">{task.title}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{task.project.code}</span>
                                                    <PriorityBadge priority={task.priority} />
                                                </div>
                                            </div>
                                            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
                                                <div className="flex items-center gap-1.5 w-32">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                                                </div>
                                                <div className="w-24">
                                                    <StatusBadge status={task.status} />
                                                </div>
                                                <div className="flex -space-x-2 w-16">
                                                    {task.assignees.map((a, i) => (
                                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-100">
                                                            {a.full_name.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <MoreHorizontal size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl shadow-sm border border-slate-100 px-6" data-testid="tasks-empty-state">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                            <CheckSquare size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Không tìm thấy công việc</h3>
                        <p className="text-slate-500 mt-2 max-w-xs font-medium">
                            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                                ? "Không tìm thấy công việc phù hợp với bộ lọc."
                                : "Bạn chưa được giao công việc nào. Tuyệt vời!"}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
