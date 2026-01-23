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
    FileText
} from 'lucide-react';
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
    const { user } = useAuthStore();
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

    // Field Permissions states
    const [fieldPermissions, setFieldPermissions] = useState<string[]>([]);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');

    // Edit/Delete Task States
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');
    const [isUpdatingTask, setIsUpdatingTask] = useState(false);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN';

    // Effects
    useEffect(() => {
        if (user) fetchTaskDetail(id, user.id);
    }, [id, user, fetchTaskDetail]);

    useEffect(() => {
        const fetchPerms = async () => {
            if (!task?.project?.id || !user) return;
            try {
                const res = await fetch(`/api/projects/${task.project.id}/field-permissions`, {
                    headers: { 'x-user-id': user.id }
                });
                const data = await res.json();
                setFieldPermissions(data.permissions?.[user.id] || []);
            } catch (error) { console.error(error); }
        };
        if (task) fetchPerms();
    }, [task, user]);

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

        // BA Rule US-EMP-02-01: Must be DONE
        if (selectedSubtaskId === 'TASK_DIRECT') {
            if (task.status_code !== 'DONE') {
                alert("Bạn chỉ có thể log time trực tiếp vào công việc chính khi nó đã ở trạng thái HOÀN THÀNH (DONE).");
                return;
            }
        } else {
            const sub = task.subtasks?.find(s => s.id === selectedSubtaskId);
            if (sub && sub.status_code !== 'DONE') {
                alert("Bạn chỉ có thể log time vào công việc con khi nó đã được đánh dấu là HOÀN THÀNH.");
                return;
            }
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

    const handleUpdateTaskAction = async () => {
        if (!editTitle.trim() || !task || !user || task.is_locked) return;

        // BA Rule: Only PM can move main task to DONE
        const isCurrentlyDone = task.status_code === 'DONE';
        const targetIsDone = editStatus === 'DONE';
        if (targetIsDone && !isCurrentlyDone && !isPM) {
            alert("Chỉ Quản lý mới có quyền chuyển trạng thái công việc chính sang DONE.");
            return;
        }

        setIsUpdatingTask(true);
        const success = await updateTask(id, user.id, {
            title: editTitle,
            description: editDescription,
            priority_code: editPriority,
            status_code: editStatus,
            due_date: editDueDate,
        });
        if (success) setIsEditDialogOpen(false);
        setIsUpdatingTask(false);
    };

    const handleDeleteTaskAction = async () => {
        if (task?.is_locked || !user) return;
        setIsDeletingTask(true);
        const success = await deleteTask(id, user.id);
        if (success) router.push('/tasks');
        else setIsDeletingTask(false);
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
                        {isPM && (
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
                                        setEditDueDate(task.due_date ? task.due_date.split('T')[0] : '');
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
                                        {(isPM || fieldPermissions.includes('description')) && !isEditingDescription && !task.is_locked && (
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
                                        {!task.is_locked && <Button variant="ghost" size="sm" onClick={() => { setEditingSubtask(null); setSubtaskTitle(''); setSubtaskDueDate(''); setIsSubtaskDialogOpen(true); }} className="text-blue-600 font-bold"><Plus size={16} /> Thêm</Button>}
                                    </div>
                                    <div className="space-y-3">
                                        {task.subtasks?.map((sub) => (
                                            <div key={sub.id} className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox checked={sub.status_code === 'DONE'} onCheckedChange={() => user && toggleSubtask(sub.id, user.id, sub.status_code)} disabled={task.is_locked} />
                                                    <div className="flex flex-col"><span className={cn("text-sm font-bold", sub.status_code === 'DONE' && "line-through text-slate-400")}>{sub.title}</span><span className="text-[10px] text-slate-400 font-bold">{sub.creator_name}</span></div>
                                                </div>
                                                {!task.is_locked && (isPM || sub.created_by === user?.id) && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" onClick={() => user && reorderSubtask(sub.id, user.id, 'UP')} className="h-7 w-7"><ChevronUp size={14} /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => user && reorderSubtask(sub.id, user.id, 'DOWN')} className="h-7 w-7"><ChevronDown size={14} /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => { setEditingSubtask(sub); setSubtaskTitle(sub.title); setSubtaskDueDate(sub.end_date || ''); setIsSubtaskDialogOpen(true); }} className="h-7 w-7 text-blue-600"><Pencil size={14} /></Button>
                                                        <Button variant="ghost" size="icon" onClick={() => user && deleteSubtask(sub.id, user.id)} className="h-7 w-7 text-rose-600"><Trash2 size={14} /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="comments" className="space-y-4 animate-in fade-in duration-500">
                                <Card className="border-none shadow-sm bg-white p-6 space-y-6">
                                    <div className="space-y-6">
                                        {task.comments?.map((comment) => (
                                            <div key={comment.id} className="flex gap-4">
                                                <Avatar className="h-8 w-8"><AvatarFallback className="bg-slate-900 text-white text-[10px]">{comment.creator_name?.charAt(0)}</AvatarFallback></Avatar>
                                                <div className="flex-1 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-xs">{comment.creator_name}</span><span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleString()}</span></div>
                                                    <div className="text-sm text-slate-600">{comment.content}</div>
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
                                                <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{file.name}</p>
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
                                <Button
                                    className={cn(
                                        "w-full font-bold h-12 rounded-xl shadow-lg transition-all",
                                        (task.is_locked || (task.status_code !== 'DONE' && (!task.subtasks || task.subtasks.length === 0)))
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                    )}
                                    onClick={() => setIsLogTimeDialogOpen(true)}
                                    disabled={task.is_locked}
                                    title={task.is_locked ? "Dữ liệu thời gian đã bị khóa" : (task.status_code === 'DONE' ? "Ghi nhận thời gian" : "Chỉ được log thời gian khi công việc hoặc công việc con hoàn thành")}
                                    data-testid="btn-open-log-time"
                                >
                                    <Clock className="mr-2" size={16} />
                                    {task.is_locked ? 'LOG TIME ĐÃ KHÓA' : (task.status_code !== 'DONE' && (!task.subtasks || task.subtasks.length === 0) ? 'CHỜ HOÀN THÀNH' : 'Ghi nhận thời gian')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Dialogs */}
                <Dialog open={isSubtaskDialogOpen} onOpenChange={setIsSubtaskDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>{editingSubtask ? 'Sửa Subtask' : 'Thêm Subtask'}</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4"><Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="Tên công việc..." /><Input type="date" value={subtaskDueDate} onChange={(e) => setSubtaskDueDate(e.target.value)} /></div>
                        <DialogFooter><DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose><Button onClick={handleSubtaskSubmitAction} disabled={isSubmittingSubtask} className="bg-blue-600">Lưu</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isLogTimeDialogOpen} onOpenChange={setIsLogTimeDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Ghi nhận thời gian</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <select className="w-full p-2 border rounded-md" value={selectedSubtaskId} onChange={(e) => setSelectedSubtaskId(e.target.value)}>
                                <option value="TASK_DIRECT">Ghi trực tiếp vào Công việc chính</option>
                                {task.subtasks?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                            <div className="flex gap-4"><Input type="number" value={logHours} onChange={(e) => setLogHours(e.target.value)} placeholder="Giờ" /><Input type="number" value={logMinutes} onChange={(e) => setLogMinutes(e.target.value)} placeholder="Phút" /></div>
                            <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
                            <Textarea value={logNote} onChange={(e) => setLogNote(e.target.value)} placeholder="Ghi chú..." />
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
                                    disabled={!isPM && !fieldPermissions.includes('title')}
                                    className={cn(!isPM && !fieldPermissions.includes('title') && "bg-slate-50 opacity-70")}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-500">Trạng thái</label>
                                    <select
                                        className={cn(
                                            "w-full p-2 border rounded-md text-sm font-medium",
                                            (!isPM && !fieldPermissions.includes('status_code')) && "bg-slate-50 opacity-70"
                                        )}
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        disabled={!isPM && !fieldPermissions.includes('status_code')}
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
                                            (!isPM && !fieldPermissions.includes('priority_code')) && "bg-slate-50 opacity-70"
                                        )}
                                        value={editPriority}
                                        onChange={(e) => setEditPriority(e.target.value)}
                                        disabled={!isPM && !fieldPermissions.includes('priority_code')}
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
                                    <label className="text-xs font-bold uppercase text-slate-500">Hạn chót</label>
                                    <Input
                                        type="date"
                                        value={editDueDate}
                                        onChange={(e) => setEditDueDate(e.target.value)}
                                        disabled={!isPM && !fieldPermissions.includes('due_date')}
                                        className={cn(!isPM && !fieldPermissions.includes('due_date') && "bg-slate-50 opacity-70")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Mô tả</label>
                                <Textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className={cn("min-h-[100px]", (!isPM && !fieldPermissions.includes('description')) && "bg-slate-50 opacity-70")}
                                    disabled={!isPM && !fieldPermissions.includes('description')}
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
        </AppLayout>
    );
}
