/**
 * Personal Kanban Board Page
 * 
 * User Stories:
 * - US-EMP-07-01: Tạo task cá nhân không thuộc bất kỳ dự án nào
 * - US-EMP-07-02: Xem task cá nhân dưới dạng Kanban Board
 * - US-EMP-07-03: Cập nhật, sắp xếp và xóa task cá nhân
 * - US-EMP-07-04: Chuyển đổi trạng thái task bằng kéo thả
 * - US-EMP-07-05: Task cá nhân hoàn toàn riêng tư
 * 
 * Business Rule: Task cá nhân hoàn toàn riêng tư, user_id = current_user
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Edit2,
    Trash2,
    Loader2,
    GripVertical,
    CheckCircle2,
    Circle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface PersonalTask {
    id: string;
    title: string;
    description: string | null;
    status_code: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority_code: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    due_date: string | null;
    sort_order: number;
}

interface KanbanColumn {
    id: 'TODO' | 'IN_PROGRESS' | 'DONE';
    title: string;
    icon: React.ReactNode;
    color: string;
}

const COLUMNS: KanbanColumn[] = [
    { id: 'TODO', title: 'Cần làm', icon: <Circle size={16} />, color: 'bg-slate-100 text-slate-600' },
    { id: 'IN_PROGRESS', title: 'Đang làm', icon: <Clock size={16} />, color: 'bg-blue-100 text-blue-600' },
    { id: 'DONE', title: 'Hoàn thành', icon: <CheckCircle2 size={16} />, color: 'bg-emerald-100 text-emerald-600' },
];

const PRIORITIES = [
    { code: 'LOW', label: 'Thấp', color: 'bg-slate-100 text-slate-600' },
    { code: 'MEDIUM', label: 'Trung bình', color: 'bg-blue-100 text-blue-600' },
    { code: 'HIGH', label: 'Cao', color: 'bg-amber-100 text-amber-700' },
    { code: 'URGENT', label: 'Khẩn cấp', color: 'bg-rose-100 text-rose-700' },
];

// Task Card Component
const TaskCard = ({
    task,
    onEdit,
    onDelete,
    onDragStart
}: {
    task: PersonalTask;
    onEdit: () => void;
    onDelete: () => void;
    onDragStart: (e: React.DragEvent) => void;
}) => {
    const priority = PRIORITIES.find(p => p.code === task.priority_code);
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status_code !== 'DONE';

    return (
        <div
            draggable
            onDragStart={onDragStart}
            className={cn(
                "p-3 bg-white rounded-lg border border-slate-100 shadow-sm cursor-grab active:cursor-grabbing",
                "hover:shadow-md transition-all group",
                task.status_code === 'DONE' && "opacity-60"
            )}
            data-testid={`task-card-${task.id}`}
        >
            <div className="flex items-start gap-2">
                <GripVertical size={14} className="text-slate-300 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1 min-w-0">
                    {/* Priority Badge */}
                    <Badge className={cn("text-[10px] font-bold border-none mb-2", priority?.color)}>
                        {priority?.label}
                    </Badge>

                    {/* Title */}
                    <h4 className={cn(
                        "font-semibold text-sm text-slate-900 line-clamp-2",
                        task.status_code === 'DONE' && "line-through text-slate-400"
                    )}>
                        {task.title}
                    </h4>

                    {/* Description */}
                    {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-xs font-medium",
                            isOverdue ? "text-rose-600" : "text-slate-400"
                        )}>
                            {isOverdue && <AlertCircle size={12} />}
                            <Calendar size={12} />
                            {new Date(task.due_date).toLocaleDateString('vi-VN')}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-blue-600"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    data-testid={`btn-edit-${task.id}`}
                >
                    <Edit2 size={12} />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-red-600"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    data-testid={`btn-delete-${task.id}`}
                >
                    <Trash2 size={12} />
                </Button>
            </div>
        </div>
    );
};

// Kanban Column Component
const KanbanColumn = ({
    column,
    tasks,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onDrop,
    draggedTaskId
}: {
    column: KanbanColumn;
    tasks: PersonalTask[];
    onAddTask: (status: string) => void;
    onEditTask: (task: PersonalTask) => void;
    onDeleteTask: (id: string) => void;
    onDrop: (e: React.DragEvent, status: string) => void;
    draggedTaskId: string | null;
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            className="flex-1 min-w-[280px] max-w-[350px]"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { setIsDragOver(false); onDrop(e, column.id); }}
            data-testid={`column-${column.id}`}
        >
            <Card className={cn(
                "border-none shadow-sm h-full transition-all",
                isDragOver && "ring-2 ring-blue-400 ring-offset-2"
            )}>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                        <span className={cn("flex items-center gap-2 px-2 py-1 rounded-lg", column.color)}>
                            {column.icon}
                            {column.title}
                        </span>
                        <Badge variant="secondary" className="text-xs font-bold">
                            {tasks.length}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[300px]">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={() => onEditTask(task)}
                            onDelete={() => onDeleteTask(task.id)}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('taskId', task.id);
                                e.dataTransfer.setData('fromStatus', task.status_code);
                            }}
                        />
                    ))}

                    {/* Add Task Button */}
                    <Button
                        variant="ghost"
                        className="w-full h-10 border-2 border-dashed border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300"
                        onClick={() => onAddTask(column.id)}
                        data-testid={`btn-add-${column.id}`}
                    >
                        <Plus size={16} className="mr-1" /> Thêm task
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

// Main Page Component
export default function PersonalBoardPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<Record<string, PersonalTask[]>>({
        TODO: [],
        IN_PROGRESS: [],
        DONE: []
    });
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);
    const [defaultStatus, setDefaultStatus] = useState<string>('TODO');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priorityCode, setPriorityCode] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch tasks
    const fetchTasks = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/personal-tasks', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setTasks(data.data || { TODO: [], IN_PROGRESS: [], DONE: [] });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    // Open dialog for new task
    const openNewTaskDialog = (status: string) => {
        setEditingTask(null);
        setDefaultStatus(status);
        setTitle('');
        setDescription('');
        setPriorityCode('MEDIUM');
        setDueDate('');
        setFormErrors({});
        setIsDialogOpen(true);
    };

    // Open dialog for edit
    const openEditDialog = (task: PersonalTask) => {
        setEditingTask(task);
        setDefaultStatus(task.status_code);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriorityCode(task.priority_code);
        setDueDate(task.due_date || '');
        setFormErrors({});
        setIsDialogOpen(true);
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                status_code: editingTask ? editingTask.status_code : defaultStatus,
                priority_code: priorityCode,
                due_date: dueDate || null
            };

            const url = editingTask
                ? `/api/personal-tasks/${editingTask.id}`
                : '/api/personal-tasks';
            const method = editingTask ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save');

            setIsDialogOpen(false);
            fetchTasks();
        } catch (error) {
            console.error('Error saving task:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete task
    const handleDelete = async (taskId: string) => {
        if (!confirm('Bạn có chắc muốn xóa task này?')) return;

        try {
            await fetch(`/api/personal-tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Handle drag and drop
    const handleDrop = async (e: React.DragEvent, toStatus: string) => {
        const taskId = e.dataTransfer.getData('taskId');
        const fromStatus = e.dataTransfer.getData('fromStatus');

        if (!taskId || fromStatus === toStatus) return;

        // Optimistic update
        const task = tasks[fromStatus].find(t => t.id === taskId);
        if (!task) return;

        setTasks(prev => ({
            ...prev,
            [fromStatus]: prev[fromStatus].filter(t => t.id !== taskId),
            [toStatus]: [...prev[toStatus], { ...task, status_code: toStatus as any }]
        }));

        // API call
        try {
            await fetch(`/api/personal-tasks/${taskId}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({ status_code: toStatus })
            });
        } catch (error) {
            console.error('Error reordering:', error);
            fetchTasks(); // Rollback on error
        }
    };

    const totalTasks = Object.values(tasks).flat().length;

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700" data-testid="personal-board-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="personal-board-title">
                            📌 Task Cá Nhân
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Quản lý công việc riêng của bạn. Hoàn toàn riêng tư.
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={() => openNewTaskDialog('TODO')}
                        data-testid="btn-add-task"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm Task
                    </Button>
                </div>

                {/* Kanban Board */}
                {loading ? (
                    <div className="flex gap-6 overflow-x-auto pb-4" data-testid="kanban-loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex-1 min-w-[280px]">
                                <Card className="border-none shadow-sm">
                                    <CardHeader className="pb-2">
                                        <Skeleton className="h-6 w-24" />
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Skeleton className="h-24 w-full" />
                                        <Skeleton className="h-24 w-full" />
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : totalTasks > 0 ? (
                    <div className="flex gap-6 overflow-x-auto pb-4" data-testid="kanban-board">
                        {COLUMNS.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasks[column.id] || []}
                                onAddTask={openNewTaskDialog}
                                onEditTask={openEditDialog}
                                onDeleteTask={handleDelete}
                                onDrop={handleDrop}
                                draggedTaskId={draggedTaskId}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm" data-testid="kanban-empty">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                                📌
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Chưa có task cá nhân nào
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Tạo task đầu tiên để theo dõi công việc riêng!
                            </p>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => openNewTaskDialog('TODO')}
                                data-testid="btn-add-task-empty"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tạo Task
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Task Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="dialog-task">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTask ? 'Chỉnh sửa Task' : 'Thêm Task Cá Nhân'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Tiêu đề <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Tên công việc..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={formErrors.title ? 'border-red-300' : ''}
                                    data-testid="input-title"
                                />
                                {formErrors.title && (
                                    <p className="text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Mô tả
                                </label>
                                <Textarea
                                    placeholder="Chi tiết công việc..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    data-testid="input-description"
                                />
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Độ ưu tiên
                                </label>
                                <Select value={priorityCode} onValueChange={setPriorityCode}>
                                    <SelectTrigger data-testid="select-priority">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((p) => (
                                            <SelectItem key={p.code} value={p.code}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Hạn chót
                                </label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    data-testid="input-due-date"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" data-testid="btn-cancel">
                                    Hủy
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-submit"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
