'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Lock,
    Plus,
    Edit2,
    Trash2,
    MoreVertical,
    RefreshCw,
    Calendar,
    Clock,
    Power,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AutoLockSchedule {
    id: string;
    name: string;
    period_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    lock_day: number;
    lock_time: string;
    is_active: boolean;
    notification_days_before: number;
    last_executed: string | null;
    next_execution: string;
    created_at: string;
}

export default function AutoLockSchedulePage() {
    const { user } = useAuthStore();
    const [schedules, setSchedules] = useState<AutoLockSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<AutoLockSchedule | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        period_type: 'MONTHLY' as AutoLockSchedule['period_type'],
        lock_day: 1,
        lock_time: '00:00',
        notification_days_before: 3,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            // Mock data - US-ORG-03-01
            const mockSchedules: AutoLockSchedule[] = [
                {
                    id: 's1', name: 'Khóa kỳ lương hàng tháng', period_type: 'MONTHLY',
                    lock_day: 5, lock_time: '00:00', is_active: true,
                    notification_days_before: 3, last_executed: '2025-01-05T00:00:00Z',
                    next_execution: '2025-02-05T00:00:00Z', created_at: '2024-01-15'
                },
                {
                    id: 's2', name: 'Khóa báo cáo tuần', period_type: 'WEEKLY',
                    lock_day: 1, lock_time: '08:00', is_active: true,
                    notification_days_before: 1, last_executed: '2025-01-20T08:00:00Z',
                    next_execution: '2025-01-27T08:00:00Z', created_at: '2024-03-01'
                },
                {
                    id: 's3', name: 'Khóa dự án cuối quý', period_type: 'CUSTOM',
                    lock_day: 0, lock_time: '23:59', is_active: false,
                    notification_days_before: 7, last_executed: '2024-12-31T23:59:00Z',
                    next_execution: '2025-03-31T23:59:00Z', created_at: '2024-06-01'
                },
            ];
            setSchedules(mockSchedules);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setEditingSchedule(null);
        setFormData({
            name: '',
            period_type: 'MONTHLY',
            lock_day: 1,
            lock_time: '00:00',
            notification_days_before: 3,
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (schedule: AutoLockSchedule) => {
        setEditingSchedule(schedule);
        setFormData({
            name: schedule.name,
            period_type: schedule.period_type,
            lock_day: schedule.lock_day,
            lock_time: schedule.lock_time,
            notification_days_before: schedule.notification_days_before,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        setIsSubmitting(true);
        try {
            if (editingSchedule) {
                setSchedules(schedules.map(s =>
                    s.id === editingSchedule.id
                        ? { ...s, ...formData }
                        : s
                ));
            } else {
                const newSchedule: AutoLockSchedule = {
                    id: `s${Date.now()}`,
                    ...formData,
                    is_active: true,
                    last_executed: null,
                    next_execution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString().split('T')[0],
                };
                setSchedules([...schedules, newSchedule]);
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = (id: string) => {
        setSchedules(schedules.map(s =>
            s.id === id ? { ...s, is_active: !s.is_active } : s
        ));
    };

    const handleDelete = (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa lịch khóa này?')) return;
        setSchedules(schedules.filter(s => s.id !== id));
    };

    const runManually = (schedule: AutoLockSchedule) => {
        if (!confirm(`Chạy "${schedule.name}" ngay bây giờ?`)) return;
        alert('Đã thêm vào hàng đợi thực thi');
    };

    const getPeriodLabel = (type: string) => {
        switch (type) {
            case 'DAILY': return 'Hàng ngày';
            case 'WEEKLY': return 'Hàng tuần';
            case 'MONTHLY': return 'Hàng tháng';
            case 'CUSTOM': return 'Tùy chỉnh';
            default: return type;
        }
    };

    const getDayLabel = (type: string, day: number) => {
        if (type === 'WEEKLY') {
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            return days[day];
        }
        if (type === 'MONTHLY') {
            return `Ngày ${day}`;
        }
        return '-';
    };

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="auto-lock-schedule-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <Lock className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Lịch khóa tự động
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Cấu hình tự động khóa kỳ (US-ORG-03-01)
                        </p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                        onClick={openCreateDialog}
                        data-testid="btn-create-schedule"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm lịch khóa
                    </Button>
                </div>

                {/* Info Banner */}
                <Card className="border-none shadow-sm bg-gradient-to-r from-amber-50 to-orange-50" data-testid="info-banner">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-medium text-amber-800">Lưu ý về khóa kỳ tự động</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Khi kỳ bị khóa, nhân viên sẽ không thể thêm/sửa time logs trong khoảng thời gian đó.
                                Hệ thống sẽ gửi thông báo trước số ngày bạn cấu hình.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedules Table */}
                <Card className="border-none shadow-sm" data-testid="schedules-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách lịch khóa</CardTitle>
                        <CardDescription>Cấu hình thời gian tự động khóa time periods</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : schedules.length > 0 ? (
                            <Table data-testid="schedules-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Tên</TableHead>
                                        <TableHead className="font-bold">Chu kỳ</TableHead>
                                        <TableHead className="font-bold">Thời điểm</TableHead>
                                        <TableHead className="font-bold">Lần tiếp theo</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map(schedule => (
                                        <TableRow key={schedule.id} data-testid={`schedule-row-${schedule.id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-lg ${schedule.is_active ? 'bg-blue-100' : 'bg-slate-100'} flex items-center justify-center`}>
                                                        <Lock className={`h-5 w-5 ${schedule.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    </div>
                                                    <span className="font-medium" data-testid={`schedule-name-${schedule.id}`}>
                                                        {schedule.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getPeriodLabel(schedule.period_type)}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    {getDayLabel(schedule.period_type, schedule.lock_day)}
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    {schedule.lock_time}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(schedule.next_execution).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={schedule.is_active}
                                                        onCheckedChange={() => handleToggle(schedule.id)}
                                                        data-testid={`switch-active-${schedule.id}`}
                                                    />
                                                    {schedule.is_active ? (
                                                        <Badge className="bg-emerald-100 text-emerald-700">Bật</Badge>
                                                    ) : (
                                                        <Badge className="bg-slate-100 text-slate-600">Tắt</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" data-testid={`schedule-actions-${schedule.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => runManually(schedule)} data-testid={`btn-run-${schedule.id}`}>
                                                            <Power className="mr-2 h-4 w-4" />
                                                            Chạy ngay
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditDialog(schedule)} data-testid={`btn-edit-${schedule.id}`}>
                                                            <Edit2 className="mr-2 h-4 w-4" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(schedule.id)}
                                                            className="text-red-600"
                                                            data-testid={`btn-delete-${schedule.id}`}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-state">
                                <Lock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Chưa có lịch khóa nào</p>
                                <p className="text-slate-400 text-sm mt-1">Thêm lịch để tự động khóa time periods</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md" data-testid="schedule-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingSchedule ? 'Chỉnh sửa lịch khóa' : 'Thêm lịch khóa mới'}
                            </DialogTitle>
                            <DialogDescription>
                                Cấu hình thời điểm tự động khóa kỳ
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tên lịch khóa *</label>
                                <Input
                                    placeholder="vd: Khóa kỳ lương hàng tháng"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    data-testid="input-name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Chu kỳ</label>
                                <Select
                                    value={formData.period_type}
                                    onValueChange={(v) => setFormData({ ...formData, period_type: v as any })}
                                >
                                    <SelectTrigger data-testid="select-period">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DAILY">Hàng ngày</SelectItem>
                                        <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                                        <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.period_type === 'WEEKLY' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Ngày trong tuần</label>
                                    <Select
                                        value={String(formData.lock_day)}
                                        onValueChange={(v) => setFormData({ ...formData, lock_day: parseInt(v) })}
                                    >
                                        <SelectTrigger data-testid="select-weekday">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Thứ 2</SelectItem>
                                            <SelectItem value="2">Thứ 3</SelectItem>
                                            <SelectItem value="3">Thứ 4</SelectItem>
                                            <SelectItem value="4">Thứ 5</SelectItem>
                                            <SelectItem value="5">Thứ 6</SelectItem>
                                            <SelectItem value="6">Thứ 7</SelectItem>
                                            <SelectItem value="0">Chủ nhật</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {formData.period_type === 'MONTHLY' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Ngày trong tháng</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={28}
                                        value={formData.lock_day}
                                        onChange={(e) => setFormData({ ...formData, lock_day: parseInt(e.target.value) || 1 })}
                                        data-testid="input-monthday"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Giờ thực hiện</label>
                                <Input
                                    type="time"
                                    value={formData.lock_time}
                                    onChange={(e) => setFormData({ ...formData, lock_time: e.target.value })}
                                    data-testid="input-time"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Thông báo trước (ngày)</label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={14}
                                    value={formData.notification_days_before}
                                    onChange={(e) => setFormData({ ...formData, notification_days_before: parseInt(e.target.value) || 0 })}
                                    data-testid="input-notification-days"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="btn-cancel">
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !formData.name.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                                data-testid="btn-submit"
                            >
                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                {editingSchedule ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
