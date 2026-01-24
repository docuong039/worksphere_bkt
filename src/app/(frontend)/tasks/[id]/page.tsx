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
    Pencil,
    Trash2,
    CheckCircle2,
    UserCircle,
    Send,
    Loader2,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    Lock,
    FileText,
    Timer
} from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { useTaskStore } from '@/stores/taskStore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, hasPermission } = useAuthStore();
    const {
        currentTask: task,
        loading,
        history,
        loadingHistory,
        fetchTaskDetail,
        updateTask,
        deleteTask,
        updateTaskFieldStore,
        addSubtask,
        updateSubtask,
        deleteSubtask,
        reorderSubtask,
        toggleSubtask,
        addComment,
        addTimeLog,
        fetchHistory
    } = useTaskStore();
    const { toast } = useToast();

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
    const [selectedSubtaskId, setSelectedSubtaskId] = useState<string>('TASK_DIRECT');
    const [isSubmittingTime, setIsSubmittingTime] = useState(false);

    // Context & Permissions
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    // Capability shortcuts
    const canUpdate = task?.capabilities?.can_update;
    const canDelete = task?.capabilities?.can_delete;
    const canLogTime = task?.capabilities?.can_log_time;
    const allowedFields = task?.capabilities?.allowed_fields || [];

    // Edit/Delete Task States
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editTypeCode, setEditTypeCode] = useState('');
    const [editStartDate, setEditStartDate] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableMembers, setAvailableMembers] = useState<any[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    // Effects
    useEffect(() => {
        if (user) {
            fetchTaskDetail(id, user.id);
        }
    }, [id, user, fetchTaskDetail]);

    useEffect(() => {
        const fetchEditOptions = async () => {
            if (!task?.project?.id || !user) return;
            try {
                // Fetch team members for assignments
                const membersRes = await fetch(`/api/projects/${task.project.id}/members`, {
                    headers: { 'x-user-id': user.id }
                });
                const membersData = await membersRes.json();
                setAvailableMembers(membersData.data || []);

                // Fetch tags for tagging
                const tagsRes = await fetch('/api/tags', {
                    headers: { 'x-user-id': user.id }
                });
                const tagsData = await tagsRes.json();
                setAvailableTags(tagsData.data || []);
            } catch (error) { console.error(error); }
        };
        if (task) fetchEditOptions();
    }, [task, user]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('logTime') === 'true' && task?.status_code === 'DONE') {
            setIsLogTimeDialogOpen(true);
        }
    }, [task]);

    // Handlers
    const handleAddCommentAction = async () => {
        if (!commentText.trim() || !user || !task || task.is_locked) return;
        setIsSubmittingComment(true);
        await addComment(id, user.id, commentText);
        setCommentText('');
        setIsSubmittingComment(false);
    };

    const handleSubtaskSubmitAction = async () => {
        if (!subtaskTitle.trim() || !task || !user || task.is_locked) return;

        // BA Rule: Subtask due date cannot exceed main task due date
        if (subtaskDueDate && task.due_date) {
            const subDate = new Date(subtaskDueDate);
            const mainDate = new Date(task.due_date);
            if (subDate > mainDate) {
                toast({
                    title: 'Lỗi ngày hoàn thành',
                    description: `Hạn chót của công việc con không được vượt quá hạn chót của công việc chính (${mainDate.toLocaleDateString('vi-VN')}).`,
                    variant: 'warning'
                });
                return;
            }
        }

        setIsSubmittingSubtask(true);
        if (editingSubtask) {
            await updateSubtask(editingSubtask.id, user.id, { title: subtaskTitle, end_date: subtaskDueDate });
        } else {
            await addSubtask(id, user.id, { title: subtaskTitle, end_date: subtaskDueDate });
        }
        setIsSubtaskDialogOpen(false);
        setIsSubmittingSubtask(false);
    };

    const handleTimeSubmitAction = async () => {
        const totalMinutes = parseInt(logHours) * 60 + parseInt(logMinutes);
        if (totalMinutes <= 0 || !task || !user || task.is_locked) return;

        // BA Rule: NO direct log if task has subtasks
        if (selectedSubtaskId === 'TASK_DIRECT') {
            if (task.subtasks && task.subtasks.length > 0) {
                alert("QUY TẮC: Công việc này có danh sách việc con. Bạn BẮT BUỘC phải chọn cụ thể một Subtask để ghi nhận thời gian.");
                return;
            }
            if (task.status_code !== 'DONE') {
                toast({ title: 'Trạng thái không hợp lệ', description: 'Bạn chỉ có thế log time trực tiếp vào công việc chính khi nó ở trạng thái DONE.', variant: 'warning' });
                return;
            }
        } else {
            const sub = task.subtasks?.find(s => s.id === selectedSubtaskId);
            if (sub && sub.status_code !== 'DONE') {
                toast({ title: 'Trạng thái không hợp lệ', description: 'Chỉ có thể log time vào công việc con khi nó đã HOÀN THÀNH.', variant: 'warning' });
                return;
            }
        }

        // BA Rule: Period Locking Check (Rule 3)
        try {
            if (task?.project?.id) {
                const locksRes = await fetch(`/api/projects/${task.project.id}/locks`, {
                    headers: { 'x-user-id': user.id }
                });
                const locksData = await locksRes.json();
                const locks = locksData.locks || [];

                const isLocked = locks.some((l: any) => {
                    if (!l.is_locked) return false;
                    const start = new Date(l.period_start);
                    const end = new Date(l.period_end);
                    const work = new Date(logDate);
                    return work >= start && work <= end;
                });

                if (isLocked) {
                    toast({
                        title: 'Kỳ làm việc bị khóa',
                        description: 'Bạn không thể ghi nhận thời gian vào khoảng thời gian này. Vui lòng liên hệ PM.',
                        variant: 'destructive'
                    });
                    return;
                }
            }
        } catch (e) {
            console.error("Lock check failed", e);
        }

        setIsSubmittingTime(true);
        await addTimeLog(id, user.id, {
            minutes: totalMinutes,
            work_date: logDate,
            note: logNote,
            subtask_id: selectedSubtaskId === 'TASK_DIRECT' ? null : selectedSubtaskId
        });
        setIsLogTimeDialogOpen(false);
        setLogMinutes('0');
        setLogHours('0');
        setLogNote('');
        setSelectedSubtaskId('TASK_DIRECT');
        setIsSubmittingTime(false);
    };

    const handleDurationSmartChange = (val: string) => {
        // Quick regex to find numbers followed by h or m
        const hMatch = val.match(/(\d+)\s*h/i);
        const mMatch = val.match(/(\d+)\s*m/i);
        const pureNumber = val.match(/^(\d+)$/);
        const decimal = val.match(/^(\d*\.?\d+)\s*h$/i);

        if (hMatch || mMatch) {
            if (hMatch) setLogHours(hMatch[1]);
            if (mMatch) setLogMinutes(mMatch[1]);
        } else if (pureNumber) {
            setLogMinutes(pureNumber[1]);
            setLogHours('0');
        } else if (decimal) {
            const h = parseFloat(decimal[1]);
            setLogHours(Math.floor(h).toString());
            setLogMinutes(Math.round((h % 1) * 60).toString());
        }
    };

    const handleUpdateTaskAction = async () => {
        if (!editTitle.trim() || !task || !user || task.is_locked) return;

        // BA Rule: Only PM can move main task to DONE
        const isCurrentlyDone = task.status_code === 'DONE';
        const targetIsDone = editStatus === 'DONE';
        if (targetIsDone && !isCurrentlyDone && !(user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN')) {
            toast({ title: 'Quyền hạn hạn chế', description: 'Chỉ Quản lý mới có quyền chuyển trạng thái công việc chính sang DONE.', variant: 'warning' });
            return;
        }

        setIsUpdatingTask(true);
        const success = await updateTask(id, user.id, {
            title: editTitle,
            description: editDescription,
            priority_code: editPriority,
            status_code: editStatus,
            type_code: editTypeCode,
            start_date: editStartDate || null,
            due_date: editDueDate || null,
            assignee_ids: selectedAssignees,
            tag_ids: selectedTags
        });

        if (success) {
            setIsEditDialogOpen(false);
            toast({ title: 'Cập nhật thành công', variant: 'success' });
        } else {
            toast({
                title: 'Lỗi cập nhật',
                description: 'Dữ liệu có thể đã bị thay đổi bởi người khác hoặc bạn không có đủ quyền.',
                variant: 'destructive'
            });
        }
        setIsUpdatingTask(false);
    };

    const handleDeleteTaskAction = async () => {
        if (task?.is_locked || !user) return;
        setIsDeletingTask(true);
        const success = await deleteTask(id, user.id);
        if (success) {
            toast({ title: 'Đã xóa công việc', variant: 'success' });
            router.push('/tasks');
        } else {
            setIsDeletingTask(false);
            toast({ title: 'Lỗi khi xóa', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
                    <Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-full" /><Skeleton className="h-48 w-full" />
                </div>
            </AppLayout>
        );
    }

    if (!task) return (
        <AppLayout>
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <AlertCircle size={48} className="mb-4 text-slate-300" />
                <p className="text-lg font-medium">Không tìm thấy công việc.</p>
                <Button variant="link" asChild><Link href="/tasks">Quay lại danh sách</Link></Button>
            </div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="task-detail-container">
                {/* Locked Banner Notification - US-MNG-01-13 */}
                {task.is_locked && (
                    <div className="mb-6 bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-center justify-between shadow-sm animate-in zoom-in duration-300">
                        <div className="flex items-center gap-4">
                            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-100">
                                <Lock className="text-white h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-rose-900 leading-none mb-1">CÔNG VIỆC ĐÃ BỊ KHÓA</h4>
                                <p className="text-xs text-rose-600 font-bold opacity-80 uppercase tracking-wider">Mọi thay đổi về trạng thái và ghi nhận thời gian (Log Time) đều bị vô hiệu hóa trong kỳ đóng băng dữ liệu.</p>
                            </div>
                        </div>
                        <AlertCircle className="text-rose-200 h-10 w-10 hidden md:block" />
                    </div>
                )}

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 group">
                        <Link href="/tasks"><ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />Quay lại Công việc</Link>
                    </Button>
                    <div className="flex gap-2">
                        {(user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN') && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("h-9 gap-2 font-bold border-slate-200", task.is_locked && "opacity-50 grayscale")}
                                    disabled={task.is_locked}
                                    title={task.is_locked ? "Công việc này đã bị khóa, không thể chỉnh sửa." : "Chỉnh sửa công việc"}
                                    onClick={() => {
                                        setEditTitle(task.title);
                                        setEditDescription(task.description || '');
                                        setEditPriority(task.priority_code);
                                        setEditStatus(task.status_code);
                                        setEditTypeCode(task.type_code);
                                        setEditStartDate(task.start_date ? task.start_date.split('T')[0] : '');
                                        setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
                                        setSelectedAssignees(task.assignees?.map(a => a.user.id) || []);
                                        setSelectedTags(task.tags?.map(t => t.id) || []);
                                        setIsEditDialogOpen(true);
                                    }}
                                >
                                    <Pencil size={14} /> Chỉnh sửa
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn("h-9 gap-2 font-bold text-rose-600 border-rose-100 hover:bg-rose-50", task.is_locked && "opacity-50 grayscale")}
                                    disabled={task.is_locked}
                                    title={task.is_locked ? "Công việc này đã bị khóa, không thể xóa." : "Xóa công việc"}
                                    onClick={() => setIsDeleteConfirmOpen(true)}
                                    data-testid="btn-delete-task"
                                >
                                    <Trash2 size={14} /> Xóa
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge className={cn(
                                    "px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider",
                                    task.priority_code === 'URGENT' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                                )} data-testid="task-priority-badge">{task.priority_code}</Badge>
                                <Badge variant="outline" className="px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider border-slate-200 text-slate-600 bg-white">
                                    {task.type_code}
                                </Badge>
                                {task.is_locked && <Badge className="px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider bg-slate-900 text-white flex gap-1 items-center"><Lock size={10} /> Đã khóa</Badge>}
                            </div>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight" data-testid="task-title-display">{task.title}</h1>
                            <div className="flex items-center gap-2 text-slate-500 font-medium">Dự án: <span className="text-slate-900 font-bold" data-testid="task-project-name">{task.project?.name || 'N/A'}</span></div>
                        </div>

                        <Tabs defaultValue="details" className="w-full" data-testid="task-tabs">
                            <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-6">
                                <TabsTrigger value="details" className="rounded-xl px-4 md:px-6 font-bold" data-testid="tab-details">Chi tiết</TabsTrigger>
                                <TabsTrigger value="comments" className="rounded-xl px-4 md:px-6 font-bold flex gap-2" data-testid="tab-comments">Thảo luận <Badge variant="secondary" className="h-5 px-1">{task.comments?.length || 0}</Badge></TabsTrigger>
                                <TabsTrigger value="attachments" className="rounded-xl px-4 md:px-6 font-bold flex gap-2" data-testid="tab-attachments">Đính kèm <Badge variant="secondary" className="h-5 px-1">{task.attachments?.length || 0}</Badge></TabsTrigger>
                                <TabsTrigger value="history" onClick={() => user && fetchHistory(id, user.id)} className="rounded-xl px-4 md:px-6 font-bold" data-testid="tab-history">Lịch sử</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-8 animate-in fade-in duration-500">
                                <Card className="border-none shadow-sm group/desc">
                                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2"><Layers size={18} className="text-blue-600" />Mô tả công việc</CardTitle>
                                        {(canUpdate || allowedFields.includes('description')) && !isEditingDescription && !task.is_locked && (
                                            <Button variant="ghost" size="sm" className="h-8 text-blue-600" onClick={() => { setTempDescription(task.description || ''); setIsEditingDescription(true); }}>Sửa</Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="pt-4">
                                        {isEditingDescription ? (
                                            <div className="space-y-3">
                                                <Textarea value={tempDescription} onChange={(e) => setTempDescription(e.target.value)} className="min-h-[150px]" data-testid="description-textarea" />
                                                <div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)}>Hủy</Button><Button size="sm" className="bg-blue-600" onClick={() => { updateTaskFieldStore(id, user!.id, 'description', tempDescription); setIsEditingDescription(false); }}>Lưu</Button></div>
                                            </div>
                                        ) : <div className="text-slate-600 whitespace-pre-wrap">{task.description || "Chưa có mô tả."}</div>}
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-lg font-bold">Công việc con ({task.subtasks?.filter(s => s.status_code === 'DONE').length || 0}/{task.subtasks?.length || 0})</h3>
                                        {!task.is_locked && hasPermission(PERMISSIONS.SUBTASK_CREATE) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingSubtask(null); setSubtaskTitle(''); setSubtaskDueDate(''); setIsSubtaskDialogOpen(true); }}
                                                className="text-blue-600 font-bold"
                                                data-testid="add-subtask-button"
                                            >
                                                <Plus size={16} /> Thêm Subtask
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        {task.subtasks?.map((sub) => {
                                            const isOwner = sub.created_by === user?.id;
                                            return (
                                                <div
                                                    key={sub.id}
                                                    className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all"
                                                    data-testid={`subtask-item-${sub.id}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={sub.status_code === 'DONE'}
                                                            onCheckedChange={() => user && toggleSubtask(sub.id, user.id, sub.status_code)}
                                                            disabled={task.is_locked || (!isOwner && !(user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN'))}
                                                            data-testid={`subtask-checkbox-${sub.id}`}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className={cn("text-sm font-bold", sub.status_code === 'DONE' && "line-through text-slate-400")} data-testid={`subtask-title-${sub.id}`}>{sub.title}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                                    <UserCircle size={10} /> {sub.creator_name || 'Hệ thống'}
                                                                </span>
                                                                {sub.end_date && (
                                                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                                        <Calendar size={10} /> Hạn: {new Date(sub.end_date).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                )}
                                                                {sub.has_logs && (
                                                                    <Badge variant="secondary" className="text-[8px] h-4 bg-emerald-50 text-emerald-600 border-none font-bold" data-testid={`subtask-log-badge-${sub.id}`}>
                                                                        ĐÃ LOG: {Math.floor((sub.logged_minutes || 0) / 60)}h {(sub.logged_minutes || 0) % 60}m
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!task.is_locked && (isOwner || user?.role === 'ORG_ADMIN') && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" onClick={() => user && reorderSubtask(sub.id, user.id, 'UP')} className="h-7 w-7" data-testid={`subtask-reorder-up-${sub.id}`}><ChevronUp size={14} /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => user && reorderSubtask(sub.id, user.id, 'DOWN')} className="h-7 w-7" data-testid={`subtask-reorder-down-${sub.id}`}><ChevronDown size={14} /></Button>
                                                            {sub.status_code === 'DONE' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => { setSelectedSubtaskId(sub.id); setIsLogTimeDialogOpen(true); }}
                                                                    className="h-7 w-7 text-emerald-600"
                                                                    title="Nhấn để Log Time cho riêng đầu việc này"
                                                                    data-testid={`subtask-log-time-${sub.id}`}
                                                                >
                                                                    <Clock size={14} />
                                                                </Button>
                                                            )}
                                                            <Button variant="ghost" size="icon" onClick={() => { setEditingSubtask(sub); setSubtaskTitle(sub.title); setSubtaskDueDate(sub.end_date || ''); setIsSubtaskDialogOpen(true); }} className="h-7 w-7 text-blue-600" data-testid={`subtask-edit-${sub.id}`}><Pencil size={14} /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => {
                                                                if (sub.has_logs) {
                                                                    toast({ title: 'Không thể xóa', description: 'Đầu việc con này đã có dữ liệu Log Time.', variant: 'warning' });
                                                                    return;
                                                                }
                                                                user && deleteSubtask(sub.id, user.id);
                                                            }} className="h-7 w-7 text-rose-600" data-testid={`subtask-delete-${sub.id}`}><Trash2 size={14} /></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="comments" className="space-y-4 animate-in fade-in duration-500">
                                <Card className="border-none shadow-sm bg-white p-6 space-y-6">
                                    <div className="space-y-6">
                                        {task.comments?.map((comment) => (
                                            <div key={comment.id} className="flex gap-4" data-testid={`comment-item-${comment.id}`}>
                                                <Avatar className="h-8 w-8"><AvatarFallback className="bg-slate-900 text-white text-[10px]">{comment.creator_name?.charAt(0)}</AvatarFallback></Avatar>
                                                <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-xs" data-testid={`comment-author-${comment.id}`}>{comment.creator_name}</span><span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleString()}</span></div>
                                                    <div className="text-sm text-slate-600" data-testid={`comment-content-${comment.id}`}>{comment.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <Textarea placeholder="Viết bình luận... (sử dụng @ để nhắc tên đồng nghiệp)" className="rounded-2xl resize-none" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                                            <Button className="bg-blue-600 rounded-xl px-6 self-end" disabled={!commentText.trim() || isSubmittingComment || task.is_locked} onClick={handleAddCommentAction}>{isSubmittingComment ? <Loader2 className="animate-spin" /> : <Send size={18} />}</Button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold ml-1">Mẹo: Bạn có thể nhắc tên đồng nghiệp bằng @username (US-EMP-01-08)</p>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attachments" className="space-y-4 animate-in fade-in duration-500">
                                <Card className="border-none shadow-sm bg-white p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2"><Paperclip size={18} className="text-blue-600" />Tài liệu đính kèm (US-EMP-01-06)</h3>
                                        <Button variant="outline" size="sm" className="h-8 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50" disabled={task.is_locked}>
                                            <Plus size={14} className="mr-1" /> Tải lên
                                        </Button>
                                    </div>

                                    {task.attachments && task.attachments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {task.attachments.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                                                    data-testid={`attachment-item-${file.id}`}
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate" data-testid={`attachment-name-${file.id}`}>{file.name}</p>
                                                        <p className="text-[10px] text-slate-400">{file.creator_name} • {new Date(file.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <Paperclip size={32} className="mx-auto text-slate-200 mb-2" />
                                            <p className="text-sm text-slate-400 font-medium">Chưa có tài liệu đính kèm.</p>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <Card className="border-none shadow-sm bg-white p-6">
                                    {loadingHistory ? <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div> : (
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
                                            {history.map((item, idx) => (
                                                <div key={idx} className="relative pl-10">
                                                    <div className="absolute left-1 top-2 h-4 w-4 bg-white border-2 border-blue-500 rounded-full z-10" />
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <p className="text-sm font-medium"><span className="font-bold">{item.user_name}</span> {item.action_text}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{new Date(item.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-8">
                        <Card className="border-none shadow-sm overflow-hidden pt-6">
                            <CardContent className="space-y-6">
                                <div className="space-y-2"><div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-widest"><span>Trạng thái</span><span className="text-blue-600">{task.status_code}</span></div><div className="bg-slate-100 h-2 rounded-full"><div className="bg-blue-600 h-full" style={{ width: task.status_code === 'DONE' ? '100%' : '50%' }} /></div></div>
                                <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase text-slate-400"><div><p className="mb-1 flex items-center gap-1"><Calendar size={12} /> Bắt đầu</p><p className="text-slate-900">{task.start_date || 'N/A'}</p></div><div><p className="mb-1 flex items-center gap-1"><Calendar size={12} /> Hết hạn</p><p className="text-slate-900">{task.due_date || 'N/A'}</p></div></div>

                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600/10 p-2 rounded-xl">
                                            <Timer size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng thời gian đã Log</p>
                                            <p className="text-lg font-black text-slate-900 leading-none">
                                                {Math.floor((task.total_logged_minutes || 0) / 60)}h {(task.total_logged_minutes || 0) % 60}m
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold text-blue-600 border-blue-100 bg-white">Roll-up</Badge>
                                </div>

                                <Separator className="bg-slate-100" />

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <UserCircle size={14} className="text-slate-400" /> Người thực hiện
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {task.assignees && task.assignees.length > 0 ? (
                                            task.assignees.map((a, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarFallback className="text-[8px] font-bold">{a.user.full_name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs font-bold text-slate-700">{a.user.full_name}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium italic">Chưa giao cho ai</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                        <Flag size={14} className="text-slate-400" /> Thẻ (Tags)
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {task.tags && task.tags.length > 0 ? (
                                            task.tags.map((tag, idx) => (
                                                <Badge key={idx} variant="outline" className="text-[9px] font-black uppercase bg-slate-50 border-slate-200">
                                                    {tag.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-xs text-slate-400 font-medium italic">Chưa có thẻ</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className={cn(
                                        "w-full font-bold h-12 rounded-xl shadow-lg transition-all",
                                        (task.is_locked || task.status_code !== 'DONE')
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                            : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                                    )}
                                    onClick={() => {
                                        if (task.status_code !== 'DONE') return;
                                        // Auto-select first done subtask if available, otherwise reset
                                        const firstDoneSub = task.subtasks?.find(s => s.status_code === 'DONE');
                                        if (task.subtasks && task.subtasks.length > 0) {
                                            setSelectedSubtaskId(firstDoneSub?.id || 'PLEASE_SELECT');
                                        } else {
                                            setSelectedSubtaskId('TASK_DIRECT');
                                        }
                                        setIsLogTimeDialogOpen(true);
                                    }}
                                    disabled={task.is_locked || task.status_code !== 'DONE'}
                                    title={task.is_locked ? "Dữ liệu thời gian đã bị khóa" : (task.status_code !== 'DONE' ? "Chỉ được log thời gian khi công việc HOÀN THÀNH (DONE)" : "Ghi nhận công sức")}
                                    data-testid="main-log-time-button"
                                >
                                    <Clock className="mr-2" size={16} />
                                    {task.is_locked ? 'LOG TIME ĐÃ KHÓA' : (task.status_code !== 'DONE' ? 'CHỜ HOÀN THÀNH' : 'Ghi nhận thời gian')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Dialogs */}
                <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSubtask ? 'Sửa công việc con' : 'Tạo kế hoạch cá nhân (Subtask)'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Tiêu đề Subtask *</label>
                                <Input
                                    value={subtaskTitle}
                                    onChange={(e) => setSubtaskTitle(e.target.value)}
                                    placeholder="Bạn định làm gì cho đầu việc này?..."
                                    className="border-slate-200 focus:ring-blue-500 rounded-xl"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Hạn hoàn thành</label>
                                    <Input
                                        type="date"
                                        value={subtaskDueDate}
                                        onChange={(e) => setSubtaskDueDate(e.target.value)}
                                        className="border-slate-200 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Người thực hiện</label>
                                    <div className="h-10 flex items-center px-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">
                                        <UserCircle size={14} className="mr-2" /> {user?.full_name} (Chính bạn)
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic font-medium">
                                * Subtask là đơn vị thực thi nhỏ nhất, không có mô tả chi tiết hay độ ưu tiên riêng.
                            </p>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline" className="rounded-xl font-bold">Hủy</Button></DialogClose>
                            <Button onClick={handleSubtaskSubmitAction} disabled={isSubmittingSubtask} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8">Lưu</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isLogTimeDialogOpen} onOpenChange={setIsLogTimeDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Ghi nhận thời gian</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-xs bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100 font-medium">
                                <b>Quy tắc Log Time:</b> Hệ thống yêu cầu công việc (hoặc công việc con) phải ở trạng thái HOÀN THÀNH mới có thể ghi nhận thời gian.
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Đối tượng ghi nhận *</label>
                                <select
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={selectedSubtaskId}
                                    onChange={(e) => setSelectedSubtaskId(e.target.value)}
                                >
                                    <option value="PLEASE_SELECT" disabled hidden>
                                        --- Vui lòng chọn một Subtask ---
                                    </option>
                                    <option value="TASK_DIRECT" disabled={task.subtasks && task.subtasks.length > 0} className={cn(task.subtasks && task.subtasks.length > 0 && "hidden")}>
                                        Ghi trực tiếp vào Công việc chính
                                    </option>
                                    {task.subtasks?.map(s => (
                                        <option key={s.id} value={s.id} disabled={s.status_code !== 'DONE'}>
                                            {s.title} {s.status_code !== 'DONE' ? "(Chưa hoàn thành)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {task.subtasks && task.subtasks.length > 0 && (
                                    <p className="text-[10px] text-slate-400 italic font-medium px-1">
                                        * Công việc này có Subtask, bạn phải log thời gian vào từng đầu việc con.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Thời gian (VD: 1h 30m, 90m, 2h) *</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder="Nhập nhanh: 1h 30m..."
                                            onChange={(e) => handleDurationSmartChange(e.target.value)}
                                            className="border-slate-200 focus:ring-blue-500 rounded-xl pl-9"
                                            data-testid="smart-duration-input"
                                        />
                                        <Timer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-100 px-3 rounded-xl border border-slate-200">
                                        <div className="text-xs font-black text-slate-900" data-testid="duration-preview">
                                            {logHours}h {logMinutes}m
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Giờ</label>
                                        <Input type="number" value={logHours} onChange={(e) => setLogHours(e.target.value)} placeholder="0" className="rounded-xl h-9" data-testid="input-log-hours" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Phút</label>
                                        <Input type="number" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} placeholder="0" className="rounded-xl h-9" data-testid="input-log-minutes" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Ngày làm việc *</label>
                                <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="rounded-xl" data-testid="input-log-date" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Ghi chú công việc</label>
                                <Textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Bạn đã làm những gì trong thời gian này?..." className="min-h-[100px] rounded-xl" data-testid="input-log-note" />
                            </div>
                        </div>
                        <DialogFooter><Button onClick={handleTimeSubmitAction} disabled={isSubmittingTime} className="bg-emerald-600 text-white">Lưu thời gian</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Sửa công việc</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Tiêu đề</label>
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    disabled={!canUpdate && !allowedFields.includes('title')}
                                    className={cn(!canUpdate && !allowedFields.includes('title') && "bg-slate-50 opacity-70")}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Trạng thái</label>
                                    <select
                                        className={cn(
                                            "w-full p-2 border rounded-md text-sm font-medium",
                                            (!canUpdate && !allowedFields.includes('status_code')) && "bg-slate-50 opacity-70"
                                        )}
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        disabled={!canUpdate && !allowedFields.includes('status_code')}
                                    >
                                        <option value="TODO">Cần làm (To Do)</option>
                                        <option value="IN_PROGRESS">Đang làm (In Progress)</option>
                                        <option value="DONE">Hoàn thành (Done)</option>
                                        <option value="BLOCKED">Bị chặn (Blocked)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Độ ưu tiên</label>
                                    <select
                                        className={cn(
                                            "w-full p-2 border rounded-md text-sm font-medium",
                                            (!canUpdate && !allowedFields.includes('priority_code')) && "bg-slate-50 opacity-70"
                                        )}
                                        value={editPriority}
                                        onChange={(e) => setEditPriority(e.target.value)}
                                        disabled={!canUpdate && !allowedFields.includes('priority_code')}
                                    >
                                        <option value="LOW">Thấp (Low)</option>
                                        <option value="MEDIUM">Trung bình (Medium)</option>
                                        <option value="HIGH">Cao (High)</option>
                                        <option value="URGENT">Khẩn cấp (Urgent)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Ngày bắt đầu</label>
                                    <Input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        disabled={!canUpdate && !allowedFields.includes('start_date')}
                                        className={cn(!canUpdate && !allowedFields.includes('start_date') && "bg-slate-50 opacity-70")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Hạn chót</label>
                                    <Input
                                        type="date"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        disabled={!canUpdate && !allowedFields.includes('due_date')}
                                        className={cn(!canUpdate && !allowedFields.includes('due_date') && "bg-slate-50 opacity-70")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Loại công việc</label>
                                <select
                                    className={cn(
                                        "w-full p-2 border rounded-md text-sm font-medium",
                                        (!canUpdate && !allowedFields.includes('type_code')) && "bg-slate-50 opacity-70"
                                    )}
                                    value={editTypeCode}
                                    onChange={(e) => setEditTypeCode(e.target.value)}
                                    disabled={!canUpdate && !allowedFields.includes('type_code')}
                                >
                                    <option value="TASK">Task</option>
                                    <option value="BUG">Bug</option>
                                    <option value="FEATURE">Feature</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Người thực hiện</label>
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-slate-50/50">
                                    {availableMembers.map(member => (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => {
                                                if (!canUpdate && !allowedFields.includes('assignees')) return;
                                                setSelectedAssignees(prev =>
                                                    prev.includes(member.id)
                                                        ? prev.filter(id => id !== member.id)
                                                        : [...prev, member.id]
                                                );
                                            }}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold transition-all",
                                                selectedAssignees.includes(member.id)
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                                            )}
                                            disabled={!canUpdate && !allowedFields.includes('assignees')}
                                        >
                                            <Avatar className="h-4 w-4">
                                                <AvatarFallback className="text-[8px]">{member.full_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {member.full_name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Thẻ (Tags)</label>
                                <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-slate-50/50">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => {
                                                if (!canUpdate && !allowedFields.includes('tags')) return;
                                                setSelectedTags(prev =>
                                                    prev.includes(tag.id)
                                                        ? prev.filter(id => id !== tag.id)
                                                        : [...prev, tag.id]
                                                );
                                            }}
                                            className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-black border uppercase transition-all",
                                                selectedTags.includes(tag.id)
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-800"
                                            )}
                                            disabled={!canUpdate && !allowedFields.includes('tags')}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Mô tả</label>
                                <Textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className={cn("min-h-[100px]", (!canUpdate && !allowedFields.includes('description')) && "bg-slate-50 opacity-70")}
                                    disabled={!canUpdate && !allowedFields.includes('description')}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
                            <Button onClick={handleUpdateTaskAction} disabled={isUpdatingTask} className="bg-blue-600 px-8 font-bold">
                                {isUpdatingTask ? <Loader2 className="animate-spin mr-2" /> : null}
                                Lưu thay đổi
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-rose-600">Xác nhận xóa</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="text-slate-600 font-medium">Bạn có chắc chắn muốn xóa công việc này? Hành động này không thể hoàn tác.</p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Hủy</Button>
                            <Button onClick={handleDeleteTaskAction} disabled={isDeletingTask} className="bg-rose-600 text-white font-bold">
                                {isDeletingTask ? <Loader2 className="animate-spin mr-2" /> : null}
                                Xóa vĩnh viễn
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout >
    );
}
