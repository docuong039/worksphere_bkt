'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Calendar,
    Flag,
    Paperclip,
    MessageSquare,
    Layers,
    Plus,
    Clock,
    MoreVertical,
    Pencil,
    Trash2,
    CheckCircle2,
    Circle,
    UserCircle,
    Send,
    Loader2,
    AlertCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';
import { History } from 'lucide-react';

interface TaskDetail {
    id: string;
    title: string;
    description: string | null;
    status_code: string;
    priority_code: string;
    type_code: string;
    start_date: string | null;
    due_date: string | null;
    project: { id: string; name: string; code: string };
    assignees: { user: { id: string; full_name: string } }[];
    subtasks: any[];
    comments: any[];
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Subtask states
    const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
    const [editingSubtask, setEditingSubtask] = useState<any>(null);
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [subtaskDueDate, setSubtaskDueDate] = useState('');
    const [isSubmittingSubtask, setIsSubmittingSubtask] = useState(false);

    // Time Log states
    const [isLogTimeDialogOpen, setIsLogTimeDialogOpen] = useState(false);
    const [logMinutes, setLogMinutes] = useState('0');
    const [logHours, setLogHours] = useState('0');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [logNote, setLogNote] = useState('');
    const [isSubmittingTime, setIsSubmittingTime] = useState(false);

    // Field Permissions states
    const [fieldPermissions, setFieldPermissions] = useState<string[]>([]);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    // Edit/Delete Task States
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const router = useRouter();

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN';

    // Activity/History states
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchTaskDetail = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks/${id}`, {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setTask(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFieldPermissions = async () => {
        if (!task?.project.id || !user) return;
        try {
            const res = await fetch(`/api/projects/${task.project.id}/field-permissions`, {
                headers: { 'x-user-id': user.id }
            });
            const data = await res.json();
            // In our mock, permissions are mapped by user_id
            setFieldPermissions(data.permissions?.[user.id] || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleReorderSubtask = async (subId: string, direction: 'UP' | 'DOWN') => {
        try {
            await fetch(`/api/subtasks/${subId}/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ direction })
            });
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        }
    };

    const updateTaskField = async (field: string, value: any) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ [field]: value })
            });
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user) fetchTaskDetail();
    }, [id, user]);

    useEffect(() => {
        if (task) fetchFieldPermissions();
    }, [task, user]);

    // Subtask Handlers
    const openAddSubtask = () => {
        setEditingSubtask(null);
        setSubtaskTitle('');
        setSubtaskDueDate('');
        setIsSubtaskDialogOpen(true);
    };

    const openEditSubtask = (sub: any) => {
        setEditingSubtask(sub);
        setSubtaskTitle(sub.title);
        setSubtaskDueDate(sub.end_date || '');
        setIsSubtaskDialogOpen(true);
    };

    const handleSubmitSubtask = async () => {
        if (!subtaskTitle.trim()) return;
        setIsSubmittingSubtask(true);
        try {
            const url = editingSubtask ? `/api/subtasks/${editingSubtask.id}` : `/api/tasks/${id}/subtasks`;
            const method = editingSubtask ? 'PUT' : 'POST';
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ title: subtaskTitle, end_date: subtaskDueDate })
            });
            setIsSubtaskDialogOpen(false);
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmittingSubtask(false);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/tasks/${id}/history`, {
                headers: { 'x-user-id': user?.id || '' }
            });
            const data = await res.json();
            setHistory(data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleDeleteSubtask = async (subId: string) => {
        if (!confirm('Bạn có chắc muốn xóa subtask này?')) return;
        try {
            await fetch(`/api/subtasks/${subId}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user?.id || '' }
            });
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleSubtask = async (subId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
        try {
            await fetch(`/api/subtasks/${subId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ status_code: newStatus })
            });
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        }
    };

    // Time Log Handlers
    const handleSubmitTime = async () => {
        const totalMinutes = parseInt(logHours) * 60 + parseInt(logMinutes);
        if (totalMinutes <= 0) return;
        setIsSubmittingTime(true);
        try {
            await fetch(`/api/tasks/${id}/time-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ minutes: totalMinutes, work_date: logDate, note: logNote })
            });
            setIsLogTimeDialogOpen(false);
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmittingTime(false);
        }
    };

    const handleUpdateTask = async () => {
        if (!editTitle.trim()) return;
        setIsUpdatingTask(true);
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority_code: editPriority,
                    due_date: editDueDate,
                })
            });
            setIsEditDialogOpen(false);
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingTask(false);
        }
    };

    const handleDeleteTask = async () => {
        setIsDeletingTask(true);
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user?.id || '' }
            });
            router.push('/tasks');
        } catch (error) {
            console.error(error);
            setIsDeletingTask(false);
        }
    };

    const openEditDialog = () => {
        if (!task) return;
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setEditPriority(task.priority_code);
        setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
        setIsEditDialogOpen(true);
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || !user) return;
        setIsSubmittingComment(true);
        try {
            await fetch(`/api/tasks/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
                body: JSON.stringify({ content: commentText })
            });
            setCommentText('');
            fetchTaskDetail();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 w-2/3">
                            <Skeleton className="h-10 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-24" />
                    </div>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-8 space-y-6">
                            <Skeleton className="h-32 w-full" />
                            <Separator />
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    if (!task) return null;

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="task-detail-container">
                {/* Top Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 group">
                        <Link href="/tasks">
                            <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Quay lại Công việc
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        {isPM && (
                            <>
                                <Button variant="outline" size="sm" className="h-9 gap-2 font-bold border-slate-200" onClick={openEditDialog}>
                                    <Pencil size={14} /> Chỉnh sửa
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 gap-2 font-bold text-rose-600 border-rose-100 hover:bg-rose-50" onClick={() => setIsDeleteConfirmOpen(true)}>
                                    <Trash2 size={14} /> Xóa
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Task Header */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge className={cn(
                                    "px-3 py-1 font-extrabold uppercase tracking-widest text-[10px] border-none",
                                    task.status_code === 'DONE' ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"
                                )} data-testid="detail-status">
                                    {task.status_code === 'DONE' ? 'HOÀN THÀNH' :
                                        task.status_code === 'IN_PROGRESS' ? 'ĐANG THỰC HIỆN' : 'CHƯA THỰC HIỆN'}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                    "px-3 py-1 font-extrabold uppercase tracking-widest text-[10px] border-slate-200",
                                    task.priority_code === 'URGENT' ? "text-rose-600 bg-rose-50 border-rose-100" : "text-slate-600"
                                )} data-testid="detail-priority">
                                    <Flag size={10} className="mr-1" />
                                    {task.priority_code === 'URGENT' ? 'KHẨN CẤP' :
                                        task.priority_code === 'HIGH' ? 'CAO' :
                                            task.priority_code === 'MEDIUM' ? 'TRUNG BÌNH' : 'THẤP'}
                                </Badge>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight" data-testid="detail-title">
                                {task.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600">{task.project.code}</span>
                                    <span>•</span>
                                    <span>{task.project.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    <span>Hạn chót: {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'Không có'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tab-based Content Area */}
                        <Tabs defaultValue="subtasks" className="w-full">
                            <TabsList className="bg-slate-100/50 p-1 rounded-xl w-full justify-start h-12 mb-6">
                                <TabsTrigger value="subtasks" className="rounded-lg px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                                    <CheckCircle2 size={16} /> Công việc con
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="rounded-lg px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500">
                                    <MessageSquare size={16} /> Thảo luận
                                </TabsTrigger>
                                <TabsTrigger value="history" onClick={fetchHistory} className="rounded-lg px-6 font-bold flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-slate-500">
                                    <History size={16} /> Lịch sử
                                </TabsTrigger>
                            </TabsList>

                            {/* Subtasks Tab */}
                            <TabsContent value="subtasks" className="space-y-6 outline-none">
                                {/* Log Time Quick Action (POL-TIME-01 Compliance) */}
                                <div className={cn(
                                    "p-4 rounded-2xl border flex items-center justify-between",
                                    task.status_code === 'DONE' ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 opacity-70"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("p-2 rounded-xl", task.status_code === 'DONE' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400")}>
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Ghi nhận thời gian (Log Time)</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">
                                                {task.status_code === 'DONE' ? 'Sẵn sàng ghi giờ' : 'Chỉ hoàn thành mới được log time'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        disabled={task.status_code !== 'DONE'}
                                        onClick={() => setIsLogTimeDialogOpen(true)}
                                        className={cn("font-bold", task.status_code === 'DONE' ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-100" : "")}
                                        data-testid="log-time-btn"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Log Time
                                    </Button>
                                </div>

                                {/* Description */}
                                <Card className="border-none shadow-sm bg-white overflow-hidden group/desc">
                                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Layers size={18} className="text-blue-600" />
                                            Mô tả công việc
                                        </CardTitle>
                                        {(isPM || fieldPermissions.includes('description')) && !isEditingDescription && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 text-blue-600 opacity-0 group-hover/desc:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    setTempDescription(task.description || '');
                                                    setIsEditingDescription(true);
                                                }}
                                            >
                                                Sửa
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        {isEditingDescription ? (
                                            <div className="space-y-3">
                                                <Textarea
                                                    value={tempDescription}
                                                    onChange={(e) => setTempDescription(e.target.value)}
                                                    className="min-h-[150px]"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)}>Hủy</Button>
                                                    <Button size="sm" className="bg-blue-600" onClick={() => {
                                                        updateTaskField('description', tempDescription);
                                                        setIsEditingDescription(false);
                                                    }}>Lưu</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap" data-testid="detail-description">
                                                {task.description || "Chưa có mô tả cho công việc này."}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                            <CheckCircle2 size={24} className="text-blue-600" />
                                            Công việc con
                                            <span className="text-sm font-bold text-slate-400 ml-2">({task.subtasks.filter(s => s.status === 'DONE').length}/{task.subtasks.length})</span>
                                        </h2>
                                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 font-bold px-4" onClick={openAddSubtask} data-testid="add-subtask-btn">
                                            <Plus className="mr-1 h-4 w-4" /> Thêm CV con
                                        </Button>
                                    </div>

                                    <div className="space-y-2" data-testid="subtasks-list">
                                        {task.subtasks.length > 0 ? [...task.subtasks].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
                                                data-testid={`subtask-item-${sub.id}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Checkbox
                                                        id={`sub-${sub.id}`}
                                                        checked={sub.status === 'DONE'}
                                                        onCheckedChange={() => handleToggleSubtask(sub.id, sub.status)}
                                                        className="w-5 h-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <label
                                                            htmlFor={`sub-${sub.id}`}
                                                            className={cn(
                                                                "text-sm font-bold text-slate-800 cursor-pointer",
                                                                sub.status === 'DONE' && "text-slate-400 line-through"
                                                            )}
                                                        >
                                                            {sub.title}
                                                        </label>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                                            {sub.creator_name} • {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {(isPM || sub.created_by === user?.id) && (
                                                        <div className="flex items-center border-r border-slate-100 pr-2 mr-2">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => handleReorderSubtask(sub.id, 'UP')}>
                                                                <ChevronUp size={14} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" onClick={() => handleReorderSubtask(sub.id, 'DOWN')}>
                                                                <ChevronDown size={14} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {(isPM || sub.created_by === user?.id) && (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => openEditSubtask(sub)}>
                                                                <Pencil size={14} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600" onClick={() => handleDeleteSubtask(sub.id)}>
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-slate-400 font-medium">Chưa có công việc con nào. Hãy chia nhỏ nhiệm vụ!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Discussion Tab */}
                            <TabsContent value="comments" className="space-y-6 outline-none">
                                <Card className="border-none shadow-sm bg-white overflow-hidden">
                                    <CardContent className="p-6 space-y-8">
                                        <div className="space-y-8" data-testid="comments-feed">
                                            {task.comments.length > 0 ? task.comments.map((comment) => (
                                                <div key={comment.id} className="flex gap-4">
                                                    <Avatar className="h-10 w-10 border-2 border-slate-50">
                                                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                                                            {comment.author_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-bold text-slate-900">{comment.author_name}</h4>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                {new Date(comment.created_at).toLocaleDateString()} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none text-sm text-slate-600 font-medium leading-relaxed">
                                                            {comment.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-center text-slate-400 font-medium py-4">Chưa có bình luận nào.</p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-slate-50">
                                                    <AvatarFallback className="bg-slate-900 text-white font-bold text-xs">
                                                        {user?.full_name?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-3">
                                                    <Textarea
                                                        placeholder="Chia sẻ cập nhật hoặc đặt câu hỏi..."
                                                        className="min-h-[100px] border-slate-200 focus:ring-blue-500 rounded-2xl resize-none p-4"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        data-testid="comment-textarea"
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            className="bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-100 h-10 rounded-xl"
                                                            disabled={!commentText.trim() || isSubmittingComment}
                                                            onClick={handlePostComment}
                                                            data-testid="send-comment-btn"
                                                        >
                                                            {isSubmittingComment ? <Loader2 className="animate-spin h-4 w-4" /> : <><Send className="mr-2 h-4 w-4" /> Gửi bình luận</>}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* History Tab */}
                            <TabsContent value="history" className="space-y-4 outline-none">
                                <Card className="border-none shadow-sm bg-white overflow-hidden">
                                    <CardContent className="p-6">
                                        {loadingHistory ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                                            </div>
                                        ) : history.length > 0 ? (
                                            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                                {history.map((event) => (
                                                    <div key={event.id} className="relative">
                                                        <div className="absolute -left-[24px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-blue-100 ring-2 ring-slate-50"></div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-bold text-slate-900">{event.actor_name}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(event.created_at).toLocaleDateString()} {new Date(event.created_at).toLocaleTimeString()}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium">
                                                                <span className="font-bold text-blue-600">{event.action}:</span> {event.summary}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-slate-400 font-medium">Chưa có lịch sử hoạt động.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar / Info Panel */}
                    <div className="space-y-8">
                        {/* Status Change Card (PM Only) */}
                        {isPM && task.status_code !== 'DONE' && (
                            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl text-white">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Cần xử lý</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-blue-100 text-sm font-medium">Xác nhận rằng tất cả các yêu cầu đã được đáp ứng trước khi hoàn thành công việc này.</p>
                                    <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold h-11" data-testid="complete-task-btn">
                                        Đánh dấu Hoàn thành
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Details Panel */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold">Chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</label>
                                    <div className="space-y-3" data-testid="detail-assignees">
                                        {task.assignees.map((a, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8 border border-slate-200">
                                                    <AvatarFallback className="text-[10px] font-bold">{a.user.full_name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-bold text-slate-800">{a.user.full_name}</span>
                                            </div>
                                        ))}
                                        {isPM && (
                                            <Button variant="ghost" className="w-full justify-start h-9 text-blue-600 font-bold hover:bg-blue-50 -ml-2">
                                                <Plus size={16} className="mr-2" /> Thêm nhân sự
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Dự án</span>
                                        <span className="text-sm font-bold text-blue-600">{task.project.code}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Phân loại</span>
                                        <Badge variant="secondary" className="font-bold text-[10px]">{task.type_code}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Ngày bắt đầu</span>
                                        <span className="text-sm font-bold text-slate-800">{task.start_date ? new Date(task.start_date).toLocaleDateString('vi-VN') : '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-500">Hạn chót</span>
                                        <span className="text-sm font-bold text-rose-600">{task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '-'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments Card */}
                        <Card className="border-none shadow-sm bg-white overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold">Tài liệu đính kèm</CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" data-testid="upload-file-btn">
                                    <Plus size={18} />
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                                    <Paperclip size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chưa có tài liệu nào</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Subtask Dialog */}
                <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingSubtask ? 'Sửa công việc con' : 'Thêm công việc con'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Tên công việc</label>
                                <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="VD: Review code..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Hạn chót</label>
                                <Input type="date" value={subtaskDueDate} onChange={(e) => setSubtaskDueDate(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                            <Button onClick={handleSubmitSubtask} disabled={isSubmittingSubtask} className="bg-blue-600">
                                {isSubmittingSubtask ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Log Time Dialog */}
                <Dialog open={isLogTimeDialogOpen} onOpenChange={setIsLogTimeDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Ghi nhận thời gian</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold">Giờ</label>
                                    <Input type="number" value={logHours} onChange={(e) => setLogHours(e.target.value)} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold">Phút</label>
                                    <Input type="number" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Ngày làm việc</label>
                                <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Ghi chú</label>
                                <Textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Bạn đã làm gì?" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                            <Button onClick={handleSubmitTime} disabled={isSubmittingTime} className="bg-emerald-600 text-white">
                                {isSubmittingTime ? 'Đang lưu...' : 'Lưu thời gian'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Task Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa công việc</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Tiêu đề</label>
                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Độ ưu tiên</label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editPriority}
                                        onChange={(e) => setEditPriority(e.target.value)}
                                    >
                                        <option value="LOW">Thấp</option>
                                        <option value="MEDIUM">Trung bình</option>
                                        <option value="HIGH">Cao</option>
                                        <option value="URGENT">Khẩn cấp</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Hạn chót</label>
                                    <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold">Mô tả</label>
                                <Textarea className="min-h-[100px]" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                            <Button onClick={handleUpdateTask} disabled={isUpdatingTask} className="bg-blue-600">
                                {isUpdatingTask ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirm Dialog */}
                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-rose-600 flex items-center gap-2">
                                <AlertCircle size={20} /> Xác nhận xóa
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-600">
                                Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Hủy</Button>
                            <Button onClick={handleDeleteTask} disabled={isDeletingTask} className="bg-rose-600 hover:bg-rose-700">
                                {isDeletingTask ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
