'use client';

import React, { useState, useEffect, use } from 'react';
import { ShieldAlert, Lock, Unlock, History, Info, AlertTriangle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function ProjectLockdownPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [lockInfo, setLockInfo] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchLockStatus();
    }, [projectId]);

    const fetchLockStatus = async () => {
        setLoading(true);
        try {
            // Mock API call - US-CEO-04-03
            const res = await fetch(`/api/projects/${projectId}/lockdown`);
            const data = await res.json();
            if (data.success) {
                setIsLocked(data.is_locked);
                setLockInfo(data.lock_info);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = async () => {
        setIsProcessing(true);
        try {
            const action = isLocked ? 'unlock' : 'lock';
            const res = await fetch(`/api/projects/${projectId}/lockdown`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, user_id: user?.id })
            });
            const data = await res.json();
            if (data.success) {
                setIsLocked(!isLocked);
                setLockInfo(data.lock_info);
                toast({
                    title: isLocked ? 'Đã mở khóa dự án' : 'Đã khóa dự án',
                    description: isLocked ? 'Mọi thay đổi hiện đã được cho phép.' : 'Dự án hiện đang ở trạng thái Read-only.',
                    variant: isLocked ? 'default' : 'destructive'
                });
            }
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể thay đổi trạng thái khóa.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <PermissionGuard permission={PERMISSIONS.PRJ_LOCK_LOCK} showFullPageError>
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Warning Banner */}
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100" asChild data-testid="btn-back-to-settings">
                        <Link href={`/projects/${projectId}/settings`}>
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                    </Button>
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest" data-testid="lockdown-page-title">Quay lại Cài đặt Dự án</h2>
                </div>

                <div
                    className={cn(
                        "p-6 rounded-3xl border-2 flex gap-4 items-start",
                        isLocked
                            ? "bg-rose-50 border-rose-100 text-rose-900"
                            : "bg-amber-50 border-amber-100 text-amber-900"
                    )}
                    data-testid="lockdown-warning-banner"
                >
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                        isLocked ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                    )}>
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight underline decoration-rose-200 underline-offset-4 mb-2">
                            {isLocked ? "DỰ ÁN ĐANG BỊ KHÓA TOÀN DIỆN" : "CẢNH BÁO QUYỀN LỰC CEO"}
                        </h3>
                        <p className="text-sm font-medium leading-relaxed opacity-80">
                            {isLocked
                                ? "Dự án này đang ở trạng thái Read-only. Mọi hành động chỉnh sửa công việc, log time, thay đổi nhân sự đều bị chặn để bảo toàn dữ liệu."
                                : "Khi dự án bị khóa, không ai (kể cả PM và Org Admin) có thể thay đổi dữ liệu. Hành động này thường dùng khi dự án kết thúc hoặc có tranh chấp pháp lý."}
                        </p>
                    </div>
                </div>

                {/* Main Control Card */}
                <Card className="border-none shadow-lg overflow-hidden" data-testid="lockdown-card">
                    <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Trạng thái Lock-down</CardTitle>
                                <CardDescription className="font-medium">Chế độ bảo vệ dữ liệu tối cao (US-CEO-04-03)</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "text-sm font-black uppercase tracking-widest",
                                    isLocked ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {isLocked ? "ĐANG KHÓA" : "ĐANG MỞ"}
                                </span>
                                <Switch
                                    checked={isLocked}
                                    onCheckedChange={handleToggleLock}
                                    disabled={isProcessing}
                                    className="data-[state=checked]:bg-rose-600 shadow-sm"
                                    data-testid="switch-lockdown"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Status Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <Lock size={16} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Người thực hiện</p>
                                        <p className="font-bold text-slate-900">{lockInfo?.user_name || 'Hệ thống'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <History size={16} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời điểm cập nhật</p>
                                        <p className="font-bold text-slate-900">{lockInfo?.at || 'Chưa xác định'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    Lưu ý: API backend sẽ trả về mã lỗi 423 (Locked) cho mọi yêu cầu ghi (POST/PUT/DELETE) khi trạng thái này được kích hoạt.
                                </p>
                            </div>
                        </div>

                        {/* Recent Audit Logs */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} /> Nhật ký thay đổi trạng thái
                            </h4>
                            <div className="space-y-3" data-testid="audit-logs-list">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl" data-testid={`audit-log-item-${i}`}>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={i === 1 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}>
                                                {i === 1 ? "LOCKED" : "UNLOCKED"}
                                            </Badge>
                                            <span className="text-sm font-bold text-slate-700">Nguyễn Thế Cường (CEO)</span>
                                        </div>
                                        <span className="text-xs text-slate-400 font-medium">15/01/2024 14:30</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PermissionGuard>
    );
}

// Helper for dynamic colors
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
