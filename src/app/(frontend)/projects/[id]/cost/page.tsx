'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
    Users,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    RefreshCw,
    Download,
    Loader2,
    Edit2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { PERMISSIONS } from '@/lib/permissions';

interface ProjectCostStats {
    project_id: string;
    project_name: string;
    project_code: string;
    total_hours: number;
    total_cost: number;
    budget: number;
    budget_used_percent: number;
    team_size: number;
    avg_hourly_rate: number;
    cost_trend: number;
}

interface MemberCost {
    user_id: string;
    user_name: string;
    position: string;
    hours_logged: number;
    hourly_rate: number;
    total_cost: number;
    cost_percent: number;
}

export default function ProjectCostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user, hasPermission } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProjectCostStats | null>(null);
    const [memberCosts, setMemberCosts] = useState<MemberCost[]>([]);
    const [timeRange, setTimeRange] = useState('month');
    const [isExporting, setIsExporting] = useState(false);
    const [editingMember, setEditingMember] = useState<MemberCost | null>(null);
    const [newRate, setNewRate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        toast({
            title: "Thành công",
            description: "Báo cáo chi phí dự án đã được chuẩn bị.",
        });
    };

    const handleRefresh = async () => {
        await fetchData();
        toast({
            title: "Cập nhật thành công",
            description: "Dữ liệu chi phí đã được làm mới.",
        });
    };

    const handleSaveRate = async () => {
        if (!editingMember || !newRate) return;
        setIsSaving(true);
        // Mock save
        await new Promise(resolve => setTimeout(resolve, 800));
        setMemberCosts(prev => prev.map(m =>
            m.user_id === editingMember.user_id
                ? { ...m, hourly_rate: Number(newRate), total_cost: m.hours_logged * Number(newRate) }
                : m
        ));
        setIsSaving(false);
        setEditingMember(null);
        toast({
            title: "Đã cập nhật",
            description: `Mức lương của ${editingMember.user_name} đã được thay đổi.`,
        });
    };

    useEffect(() => {
        fetchData();
    }, [projectId, timeRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Mock data - US-CEO-02-02
            const mockStats: ProjectCostStats = {
                project_id: projectId,
                project_name: 'Worksphere Platform',
                project_code: 'WSP',
                total_hours: 520,
                total_cost: 182000000,
                budget: 250000000,
                budget_used_percent: 72.8,
                team_size: 8,
                avg_hourly_rate: 350000,
                cost_trend: 12,
            };

            const mockMemberCosts: MemberCost[] = [
                { user_id: 'u1', user_name: 'Nguyễn Văn A', position: 'Senior Developer', hours_logged: 120, hourly_rate: 400000, total_cost: 48000000, cost_percent: 26.4 },
                { user_id: 'u2', user_name: 'Trần Thị B', position: 'Middle Developer', hours_logged: 100, hourly_rate: 350000, total_cost: 35000000, cost_percent: 19.2 },
                { user_id: 'u3', user_name: 'Lê Văn C', position: 'UI/UX Designer', hours_logged: 80, hourly_rate: 380000, total_cost: 30400000, cost_percent: 16.7 },
                { user_id: 'u4', user_name: 'Phạm Thị D', position: 'QA Engineer', hours_logged: 90, hourly_rate: 300000, total_cost: 27000000, cost_percent: 14.8 },
                { user_id: 'u5', user_name: 'Hoàng Văn E', position: 'Junior Developer', hours_logged: 80, hourly_rate: 250000, total_cost: 20000000, cost_percent: 11.0 },
                { user_id: 'u6', user_name: 'Vũ Thị F', position: 'Project Manager', hours_logged: 50, hourly_rate: 430000, total_cost: 21500000, cost_percent: 11.8 },
            ];

            setStats(mockStats);
            setMemberCosts(mockMemberCosts.sort((a, b) => b.total_cost - a.total_cost));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(value);
    };

    const formatCurrencyFull = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const canViewCost = hasPermission(PERMISSIONS.COMPENSATION_READ) || user?.role === 'CEO' || user?.role === 'SYS_ADMIN';
    const canEditRate = hasPermission(PERMISSIONS.COMPENSATION_UPDATE) || user?.role === 'SYS_ADMIN';

    if (!canViewCost) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4" data-testid="access-denied">
                <div className="bg-red-50 p-4 rounded-full">
                    <DollarSign className="h-12 w-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Truy cập bị từ chối</h2>
                <p className="text-slate-500 max-w-md text-center">
                    Bạn không có quyền xem thông tin chi phí của dự án này. Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là một sai sót.
                </p>
                <Button asChild variant="outline">
                    <Link href={`/projects/${projectId}/overview`}>Quay lại dự án</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10" data-testid="project-cost-page">
            {/* Header - now using shared layout */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800" data-testid="project-cost-page-title">
                        <DollarSign className="inline-block mr-2 h-5 w-5 text-emerald-600" />
                        Theo dõi Chi phí
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px] h-9" data-testid="project-cost-select-time-range">
                            <SelectValue placeholder="Thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                            <SelectItem value="quarter">Quý này</SelectItem>
                            <SelectItem value="year">Năm nay</SelectItem>
                            <SelectItem value="all">Toàn bộ</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={handleRefresh} data-testid="project-cost-btn-refresh" className="h-9">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting} data-testid="project-cost-btn-export" className="h-9 font-bold gap-2">
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Xuất báo cáo
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="space-y-4" data-testid="project-cost-loading-skeleton">
                    <Skeleton className="h-32 w-full" />
                    <div className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            ) : stats && (
                <>
                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-teal-50 md:col-span-1" data-testid="stat-total-cost">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="h-14 w-14 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <DollarSign className="h-7 w-7 text-emerald-600" />
                                    </div>
                                    <Badge className={stats.cost_trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                        {stats.cost_trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        {Math.abs(stats.cost_trend)}%
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-slate-500 font-medium">Tổng chi phí</p>
                                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.total_cost)}</p>
                                    <p className="text-sm text-slate-400 mt-1">từ {stats.total_hours} giờ làm việc</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm" data-testid="stat-budget">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <PieChart className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="text-2xl font-bold text-blue-600">{stats.budget_used_percent.toFixed(0)}%</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Ngân sách đã dùng</p>
                                <div className="mt-2 h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${stats.budget_used_percent > 90 ? 'bg-red-500' : stats.budget_used_percent > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${stats.budget_used_percent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    {formatCurrency(stats.total_cost)} / {formatCurrency(stats.budget)}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm" data-testid="stat-team">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4 h-full">
                                    <div>
                                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <p className="text-xs text-slate-500">Thành viên</p>
                                        <p className="text-xl font-bold">{stats.team_size}</p>
                                    </div>
                                    <div>
                                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <p className="text-xs text-slate-500">Hourly Rate TB</p>
                                        <p className="text-xl font-bold">{formatCurrency(stats.avg_hourly_rate)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Member Costs */}
                    <Card className="border-none shadow-sm" data-testid="member-costs-card">
                        <CardHeader className="border-b border-slate-100">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Chi phí theo thành viên
                            </CardTitle>
                            <CardDescription>Phân bổ chi phí nhân sự trong dự án</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4" data-testid="member-costs-list">
                                {memberCosts.map((member, index) => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-colors"
                                        data-testid={`member-cost-${member.user_id}`}
                                    >
                                        <div className="w-8 text-center">
                                            <span className={`text-lg font-bold ${index < 3 ? 'text-amber-500' : 'text-slate-400'}`}>
                                                #{index + 1}
                                            </span>
                                        </div>
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                                                {member.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900">{member.user_name}</p>
                                            <p className="text-xs text-slate-500">{member.position}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">{member.hours_logged}h × {formatCurrency(member.hourly_rate)}</p>
                                        </div>
                                        <div className="w-32">
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                                    style={{ width: `${member.cost_percent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 text-right">{member.cost_percent.toFixed(1)}%</p>
                                        </div>
                                        <div className="w-28 text-right flex items-center justify-end gap-3">
                                            <p className="font-bold text-emerald-600" data-testid={`member-cost-value-${member.user_id}`}>
                                                {formatCurrency(member.total_cost)}
                                            </p>
                                            {canEditRate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() => {
                                                        setEditingMember(member);
                                                        setNewRate(member.hourly_rate.toString());
                                                    }}
                                                    data-testid={`btn-edit-rate-${member.user_id}`}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
                        <DialogContent data-testid="edit-rate-dialog">
                            <DialogHeader>
                                <DialogTitle>Cập nhật Mức lương / Chi phí</DialogTitle>
                                <DialogDescription>
                                    Thay đổi mức lương cho <strong>{editingMember?.user_name}</strong> trong phạm vi dự án này.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Mức lương mỗi giờ (VND)</label>
                                    <Input
                                        type="number"
                                        value={newRate}
                                        onChange={e => setNewRate(e.target.value)}
                                        placeholder="VD: 350000"
                                        data-testid="input-member-rate"
                                    />
                                    <p className="text-[10px] text-slate-500 italic">
                                        * Lương này chỉ áp dụng để tính toán chi phí cho các task thuộc dự án hiện tại.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setEditingMember(null)}>Hủy</Button>
                                <Button className="bg-blue-600" onClick={handleSaveRate} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                    Xác nhận thay đổi
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
