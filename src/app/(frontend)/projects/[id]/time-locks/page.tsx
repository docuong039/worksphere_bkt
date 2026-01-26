'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Lock,
    Unlock,
    Plus,
    Calendar,
    AlertTriangle,
    CheckCircle2,
    Clock,
    MoreVertical,
    Trash2,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkPeriodLock {
    id: string;
    period_start: string;
    period_end: string;
    is_locked: boolean;
    created_at: string;
    created_by_name: string;
}

export default function TimeLocksPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [locks, setLocks] = useState<WorkPeriodLock[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();

    // Form state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN' || user?.role === 'SYS_ADMIN';

    const fetchLocks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}/locks`, {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            setLocks(data.locks || []);
            setProjectName(data.projectName || 'Project');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchLocks();
    }, [id, user]);

    const handleCreateLock = async () => {
        if (!startDate || !endDate) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/projects/${id}/locks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    period_start: startDate,
                    period_end: endDate,
                    created_by_name: user?.full_name
                })
            });

            if (res.ok) {
                toast({
                    title: "Thành công",
                    description: "Đã tạo khóa kỳ công mới.",
                });
                fetchLocks();
                setIsCreateOpen(false);
                setStartDate('');
                setEndDate('');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleLock = async (lockId: string, currentStatus: boolean) => {
        setProcessingId(lockId);
        try {
            const res = await fetch(`/api/projects/${id}/locks/${lockId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({ is_locked: !currentStatus })
            });
            if (res.ok) {
                toast({
                    title: !currentStatus ? "Đã khóa kỳ công" : "Đã mở khóa kỳ công",
                    description: !currentStatus
                        ? "Hệ thống đã chặn mọi thao tác trong giai đoạn này."
                        : "Giai đoạn này hiện đã có thể chỉnh sửa lại.",
                });
                fetchLocks();
            } else {
                throw new Error("Failed to update lock status");
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể thay đổi trạng thái khóa. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setProcessingId(null);
        }
    };

    if (!isPM) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                <AlertTriangle size={48} className="text-amber-500 mb-6" />
                <h2 className="text-2xl font-black text-slate-900">Truy cập bị từ chối</h2>
                <p className="text-slate-500 mt-2 max-w-xs font-medium">Chỉ Quản lý dự án mới có quyền quản lý khóa kỳ công.</p>
                <Button className="mt-6 bg-blue-600" asChild>
                    <Link href={`/projects/${id}/overview`}>Quay lại Dự án</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="time-locks-container">
            {/* Header - now using shared layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100" asChild data-testid="btn-back-to-settings">
                        <Link href={`/projects/${id}/settings`}>
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-slate-800 tracking-tight" data-testid="time-locks-title">
                            Khóa kỳ công (Work Period Locks)
                        </h2>
                    </div>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold shadow-lg shadow-blue-100" data-testid="create-lock-btn" size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Tạo khóa mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="create-lock-dialog">
                        <DialogHeader>
                            <DialogTitle>Tạo khóa kỳ công</DialogTitle>
                            <DialogDescription>
                                Xác định khoảng thời gian để khóa tất cả hoạt động công việc và nhật ký thời gian.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Ngày bắt đầu</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        data-testid="lock-start-date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase">Ngày kết thúc</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        data-testid="lock-end-date"
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <p className="text-xs font-medium leading-relaxed">
                                    Khi đã khóa, người dùng sẽ không thể ghi nhận thời gian, xóa mục hoặc thay đổi trạng thái công việc trong khoảng thời gian này.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleCreateLock}
                                disabled={!startDate || !endDate || isSubmitting}
                                data-testid="confirm-create-lock"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận khóa"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List of Locks */}
            <div className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
                    </div>
                ) : locks.length > 0 ? (
                    <div className="grid gap-4" data-testid="locks-list">
                        {locks.map((lock) => (
                            <Card
                                key={lock.id}
                                className={cn(
                                    "border-none shadow-sm transition-all duration-300",
                                    lock.is_locked ? "bg-white" : "bg-slate-50/50 opacity-80"
                                )}
                                data-testid={`lock-item-${lock.id}`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                                lock.is_locked ? "bg-rose-50 text-rose-600 shadow-sm" : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {lock.is_locked ? <Lock size={20} /> : <Unlock size={20} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-black text-slate-900">
                                                        {new Date(lock.period_start).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(lock.period_end).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <Badge variant={lock.is_locked ? "destructive" : "secondary"} className="text-[10px] uppercase font-black tracking-widest px-2">
                                                        {lock.is_locked ? 'Đang khóa' : 'Mở khóa'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Created: {new Date(lock.created_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={14} /> By: {lock.created_by_name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant={lock.is_locked ? "outline" : "default"}
                                                className={cn(
                                                    "h-10 px-6 font-bold transition-all",
                                                    !lock.is_locked && "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                                                )}
                                                onClick={() => toggleLock(lock.id, lock.is_locked)}
                                                disabled={processingId === lock.id}
                                                data-testid={`toggle-lock-${lock.id}`}
                                            >
                                                {processingId === lock.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : lock.is_locked ? (
                                                    <><Unlock className="mr-2 h-4 w-4" /> Mở khóa</>
                                                ) : (
                                                    <><Lock className="mr-2 h-4 w-4" /> Khóa ngay</>
                                                )}
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-slate-400">
                                                        <MoreVertical size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="font-medium">View related activity</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-rose-600 font-bold">
                                                        <Trash2 size={14} className="mr-2" /> Delete Lock
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-none shadow-sm bg-white p-20 text-center" data-testid="locks-empty-state">
                        <CardContent className="space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto">
                                <Clock size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900">Chưa có khóa kỳ công nào</h3>
                                <p className="text-slate-500 max-sm mx-auto font-medium">Tạo khóa đầu tiên để bảo vệ dữ liệu dự án cho việc kiểm toán và thanh toán.</p>
                            </div>
                            <Button className="bg-blue-600" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Thiết lập kỳ đầu tiên
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Info Note */}
            <div className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <h4 className="text-sm font-black text-blue-900 mb-2 uppercase tracking-widest">Tóm tắt quy tắc nghiệp vụ</h4>
                <ul className="space-y-2">
                    {[
                        "Các kỳ đã khóa sẽ ngăn chặn mọi việc ghi nhận thời gian hoặc thay đổi trạng thái công việc.",
                        "Nhân viên chỉ có thể đề xuất chỉnh sửa cho các kỳ đã qua nếu chúng được mở khóa bởi Quản lý dự án.",
                        "Việc khóa thường được thực hiện hàng tuần hoặc hàng tháng sau khi xác minh báo cáo công việc.",
                        "Quản trị viên hệ thống có thể ghi đè khóa nếu cần thiết để bảo trì cơ sở dữ liệu."
                    ].map((rule, i) => (
                        <li key={i} className="text-xs font-semibold text-blue-700/70 flex gap-2">
                            <CheckCircle2 size={14} className="text-blue-500 mt-0.5" />
                            {rule}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
