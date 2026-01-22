/**
 * Time Logs Page
 * 
 * User Stories:
 * - US-EMP-02-01: Log time vào task
 * - US-EMP-02-02: Log time vào subtask
 * - US-EMP-02-03: Xem lịch sử log time trong ngày/tuần
 * - US-EMP-02-04: Sửa/xóa log time
 * 
 * Business Rules (from Epic EMP-02):
 * - Chỉ log time khi Task/Subtask ở trạng thái DONE
 * - Nếu Task có Subtask: bắt buộc log vào Subtask
 * - Ownership: chỉ owner mới được sửa/xóa
 * - Không sửa khi bị Lock (work_period_locks)
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS, Prisma
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    Plus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    Lock,
    Loader2,
    AlertCircle,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface TimeLogEntry {
    id: string;
    project: { id: string; name: string; code: string };
    task: { id: string; title: string };
    subtask: { id: string; title: string } | null;
    work_date: string;
    minutes: number;
    note: string | null;
    is_locked: boolean;
    created_at: string;
}

interface DoneTaskOption {
    id: string;
    title: string;
    project_name: string;
    type: 'TASK' | 'SUBTASK';
    parent_task_id?: string;
}

// Helper: format minutes to "Xh Ym"
const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

// Helper: get week range
const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: new Date(monday), end: sunday };
};

// Helper: format date to display
const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// TimeLog Entry Card Component
const TimeLogCard = ({
    entry,
    onEdit,
    onDelete
}: {
    entry: TimeLogEntry;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <div
            className={cn(
                "p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-all group",
                entry.is_locked && "bg-slate-50 opacity-75"
            )}
            data-testid={`timelog-entry-${entry.id}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-bold text-blue-600 bg-blue-50 border-blue-100">
                            {entry.project.code}
                        </Badge>
                        {entry.is_locked && (
                            <Badge variant="secondary" className="text-[10px] font-bold text-amber-600 bg-amber-50 border-none">
                                <Lock size={10} className="mr-1" />
                                Đã khóa
                            </Badge>
                        )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                        {entry.task.title}
                    </h4>
                    {entry.subtask && (
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                            Subtask: {entry.subtask.title}
                        </p>
                    )}
                    {entry.note && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                            {entry.note}
                        </p>
                    )}
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-black text-slate-900">
                        {formatDuration(entry.minutes)}
                    </span>
                    {!entry.is_locked && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                onClick={onEdit}
                                data-testid={`btn-edit-${entry.id}`}
                            >
                                <Edit2 size={14} />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-red-600"
                                onClick={onDelete}
                                data-testid={`btn-delete-${entry.id}`}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main Page Component
export default function TimeLogsPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [weekRange, setWeekRange] = useState(getWeekRange(new Date()));

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<TimeLogEntry | null>(null);
    const [doneTaskOptions, setDoneTaskOptions] = useState<DoneTaskOption[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [workDate, setWorkDate] = useState('');
    const [hours, setHours] = useState('0');
    const [minutes, setMinutes] = useState('0');
    const [note, setNote] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Fetch time logs
    const fetchTimeLogs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                date_from: weekRange.start.toISOString().split('T')[0],
                date_to: weekRange.end.toISOString().split('T')[0]
            });
            const res = await fetch(`/api/time-logs?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setTimeLogs(data.data || []);
        } catch (error) {
            console.error('Error fetching time logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch done tasks for dropdown
    const fetchDoneTasks = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/tasks/done-for-timelog', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setDoneTaskOptions(data.data || []);
        } catch (error) {
            console.error('Error fetching done tasks:', error);
        }
    };

    useEffect(() => {
        setWeekRange(getWeekRange(new Date(currentWeek)));
    }, [currentWeek]);

    useEffect(() => {
        if (user) {
            fetchTimeLogs();
        }
    }, [user, weekRange]);

    // Navigate weeks
    const goToPrevWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeek(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeek(newDate);
    };

    // Group logs by date
    const logsByDate = timeLogs.reduce((acc, log) => {
        const date = log.work_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {} as Record<string, TimeLogEntry[]>);

    // Calculate totals
    const weekTotal = timeLogs.reduce((sum, log) => sum + log.minutes, 0);

    // Open dialog for new log
    const openNewLogDialog = () => {
        setEditingLog(null);
        setSelectedTaskId('');
        setWorkDate(new Date().toISOString().split('T')[0]);
        setHours('0');
        setMinutes('0');
        setNote('');
        setFormErrors({});
        fetchDoneTasks();
        setIsDialogOpen(true);
    };

    // Open dialog for edit
    const openEditDialog = (log: TimeLogEntry) => {
        setEditingLog(log);
        setSelectedTaskId(log.subtask ? `subtask:${log.subtask.id}` : `task:${log.task.id}`);
        setWorkDate(log.work_date);
        setHours(String(Math.floor(log.minutes / 60)));
        setMinutes(String(log.minutes % 60));
        setNote(log.note || '');
        setFormErrors({});
        fetchDoneTasks();
        setIsDialogOpen(true);
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!selectedTaskId) {
            errors.task = 'Vui lòng chọn task';
        }
        if (!workDate) {
            errors.date = 'Vui lòng chọn ngày';
        } else if (new Date(workDate) > new Date()) {
            errors.date = 'Không thể log time cho ngày tương lai';
        }

        const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
        if (totalMinutes <= 0) {
            errors.time = 'Thời gian phải lớn hơn 0';
        } else if (totalMinutes > 24 * 60) {
            errors.time = 'Không thể log quá 24 giờ/ngày';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
            const [type, id] = selectedTaskId.split(':');

            const payload = {
                task_id: type === 'task' ? id : doneTaskOptions.find(t => t.id === id)?.parent_task_id,
                subtask_id: type === 'subtask' ? id : undefined,
                work_date: workDate,
                minutes: totalMinutes,
                note: note || undefined
            };

            const url = editingLog
                ? `/api/time-logs/${editingLog.id}`
                : '/api/time-logs';
            const method = editingLog ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Có lỗi xảy ra');
            }

            setIsDialogOpen(false);
            fetchTimeLogs();
        } catch (error: any) {
            setFormErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete log
    const handleDelete = async (logId: string) => {
        if (!confirm('Bạn có chắc muốn xóa log time này?')) return;

        try {
            await fetch(`/api/time-logs/${logId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            fetchTimeLogs();
        } catch (error) {
            console.error('Error deleting time log:', error);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8 animate-in fade-in duration-700" data-testid="timelogs-page-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="timelogs-page-title">
                            <Timer className="inline-block mr-2 h-8 w-8 text-blue-600" />
                            Nhật ký thời gian
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Ghi nhận và theo dõi thời gian làm việc của bạn.
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={openNewLogDialog}
                        data-testid="btn-log-time"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Log Time
                    </Button>
                </div>

                {/* Week Navigation */}
                <Card className="border-none shadow-sm" data-testid="week-navigator">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToPrevWeek}
                                data-testid="btn-prev-week"
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-500">
                                    <Calendar className="inline-block mr-1 h-4 w-4" />
                                    {weekRange.start.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}
                                    {' - '}
                                    {weekRange.end.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-2xl font-black text-slate-900 mt-1" data-testid="week-total">
                                    Tổng: {formatDuration(weekTotal)}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={goToNextWeek}
                                data-testid="btn-next-week"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Time Logs List */}
                {loading ? (
                    <div className="space-y-6" data-testid="timelogs-loading">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="border-none shadow-sm">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-5 w-40" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : Object.keys(logsByDate).length > 0 ? (
                    <div className="space-y-6" data-testid="timelogs-list">
                        {Object.entries(logsByDate)
                            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                            .map(([date, logs]) => {
                                const dayTotal = logs.reduce((sum, l) => sum + l.minutes, 0);
                                return (
                                    <Card key={date} className="border-none shadow-sm" data-testid={`day-group-${date}`}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-bold text-slate-700">
                                                    {formatDateDisplay(new Date(date))}
                                                </CardTitle>
                                                <Badge variant="secondary" className="font-bold">
                                                    Tổng: {formatDuration(dayTotal)}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {logs.map((log) => (
                                                <TimeLogCard
                                                    key={log.id}
                                                    entry={log}
                                                    onEdit={() => openEditDialog(log)}
                                                    onDelete={() => handleDelete(log.id)}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm" data-testid="timelogs-empty">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                <Clock className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Chưa có log time nào
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Bắt đầu ghi nhận thời gian làm việc của bạn!
                            </p>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={openNewLogDialog}
                                data-testid="btn-log-time-empty"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Log Time
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Log Time Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="dialog-log-time">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Timer className="h-5 w-5 text-blue-600" />
                                {editingLog ? 'Chỉnh sửa log time' : 'Ghi nhận thời gian'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {formErrors.submit && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5" />
                                    {formErrors.submit}
                                </div>
                            )}

                            {/* Task Select */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Task/Subtask <span className="text-red-500">*</span>
                                </label>
                                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                                    <SelectTrigger data-testid="select-task" className={formErrors.task ? 'border-red-300' : ''}>
                                        <SelectValue placeholder="Chọn task hoặc subtask đã hoàn thành..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doneTaskOptions.map((opt) => (
                                            <SelectItem
                                                key={`${opt.type}:${opt.id}`}
                                                value={`${opt.type.toLowerCase()}:${opt.id}`}
                                            >
                                                <span className="text-slate-400 text-xs mr-2">
                                                    [{opt.project_name}]
                                                </span>
                                                {opt.type === 'SUBTASK' && '↳ '}
                                                {opt.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-400">
                                    ⚠️ Chỉ hiển thị Task/Subtask có trạng thái Done
                                </p>
                                {formErrors.task && (
                                    <p className="text-sm text-red-600">{formErrors.task}</p>
                                )}
                            </div>

                            {/* Work Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Ngày làm việc <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={workDate}
                                    onChange={(e) => setWorkDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={formErrors.date ? 'border-red-300' : ''}
                                    data-testid="input-work-date"
                                />
                                {formErrors.date && (
                                    <p className="text-sm text-red-600">{formErrors.date}</p>
                                )}
                            </div>

                            {/* Time Duration */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Thời gian <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        className="w-20"
                                        data-testid="input-hours"
                                    />
                                    <span className="text-slate-500 font-medium">h</span>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        className="w-20"
                                        data-testid="input-minutes"
                                    />
                                    <span className="text-slate-500 font-medium">m</span>
                                </div>
                                {formErrors.time && (
                                    <p className="text-sm text-red-600">{formErrors.time}</p>
                                )}
                            </div>

                            {/* Note */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Ghi chú
                                </label>
                                <Textarea
                                    placeholder="Mô tả công việc đã làm..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    data-testid="input-note"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" data-testid="timelogs-btn-cancel">
                                    Hủy
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="timelogs-btn-submit"
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
