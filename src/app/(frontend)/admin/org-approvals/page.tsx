'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    Building2,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    RefreshCw,
    Filter,
    Calendar,
    Users,
    Mail,
    Shield
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';

interface OrgApplication {
    id: string;
    org_name: string;
    org_slug: string;
    owner_name: string;
    owner_email: string;
    plan_requested: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
    employee_count: number;
    industry: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reason?: string;
    submitted_at: string;
    processed_at?: string;
    processed_by?: string;
}

export default function OrgApprovalsPage() {
    const { user } = useAuthStore();
    const [applications, setApplications] = useState<OrgApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING');

    // Detail/Action Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<OrgApplication | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/org-approvals', {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedApp) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/org-approvals/${selectedApp.id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(applications.map(a =>
                    a.id === selectedApp.id
                        ? { ...a, status: 'APPROVED' as const, processed_at: new Date().toISOString(), processed_by: user?.full_name }
                        : a
                ));
                setDialogOpen(false);
            }
        } catch (error) {
            console.error('Error approving application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp || !rejectReason.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/admin/org-approvals/${selectedApp.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            const data = await res.json();
            if (data.success) {
                setApplications(applications.map(a =>
                    a.id === selectedApp.id
                        ? { ...a, status: 'REJECTED' as const, reason: rejectReason, processed_at: new Date().toISOString(), processed_by: user?.full_name }
                        : a
                ));
                setDialogOpen(false);
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge className="bg-amber-100 text-amber-700">Chờ duyệt</Badge>;
            case 'APPROVED': return <Badge className="bg-emerald-100 text-emerald-700">Đã duyệt</Badge>;
            case 'REJECTED': return <Badge className="bg-red-100 text-red-700">Từ chối</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'FREE': return <Badge variant="outline">Miễn phí</Badge>;
            case 'BASIC': return <Badge className="bg-blue-100 text-blue-700">Cơ bản</Badge>;
            case 'PROFESSIONAL': return <Badge className="bg-purple-100 text-purple-700">Chuyên nghiệp</Badge>;
            case 'ENTERPRISE': return <Badge className="bg-slate-800 text-white">Doanh nghiệp</Badge>;
            default: return <Badge variant="outline">{plan}</Badge>;
        }
    };

    const filteredApps = applications.filter(a => {
        const matchSearch = a.org_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.owner_email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        pending: applications.filter(a => a.status === 'PENDING').length,
        approved: applications.filter(a => a.status === 'APPROVED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.PLATFORM_ORG_APPROVE} showFullPageError>
                <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="org-approvals-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="org-approvals-title">
                                <CheckCircle2 className="inline-block mr-2 h-8 w-8 text-indigo-600" />
                                Phê duyệt Tổ chức
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Xem và xét duyệt các yêu cầu đăng ký tổ chức mới tham gia nền tảng.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 font-bold border-slate-200"
                            onClick={fetchApplications}
                            data-testid="btn-refresh-approvals"
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            Làm mới
                        </Button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm border-l-4 border-l-amber-500" data-testid="stat-pending">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Chờ duyệt</p>
                                    <p className="text-xl font-black text-slate-900">{stats.pending}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm border-l-4 border-l-emerald-500" data-testid="stat-approved">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Đã duyệt</p>
                                    <p className="text-xl font-black text-slate-900">{stats.approved}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm border-l-4 border-l-rose-500" data-testid="stat-rejected">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">Từ chối</p>
                                    <p className="text-xl font-black text-slate-900">{stats.rejected}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Applications List */}
                    <Card className="border-none shadow-sm overflow-hidden" data-testid="approvals-table-card">
                        <CardHeader className="bg-slate-50/50 pb-4">
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="relative max-w-sm w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm theo tên hoặc người đăng ký..."
                                        className="pl-9 bg-white border-slate-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        data-testid="input-search-approvals"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px] bg-white border-slate-200" data-testid="select-status-filter">
                                            <Filter className="mr-2 h-4 w-4 text-slate-400" />
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                            <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                            <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow>
                                        <TableHead className="font-bold text-slate-900">Tổ chức</TableHead>
                                        <TableHead className="font-bold text-slate-900">Người đăng ký</TableHead>
                                        <TableHead className="font-bold text-slate-900">Gói & Quy mô</TableHead>
                                        <TableHead className="font-bold text-slate-900">Trạng thái</TableHead>
                                        <TableHead className="font-bold text-right text-slate-900">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell colSpan={5}><Skeleton className="h-12 w-full" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredApps.length > 0 ? (
                                        filteredApps.map((app) => (
                                            <TableRow key={app.id} className="group hover:bg-slate-50/50 transition-colors" data-testid={`approval-row-${app.org_slug}`}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-bold text-slate-900" data-testid={`cell-org-name-${app.org_slug}`}>{app.org_name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{app.org_slug}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-700" data-testid={`cell-owner-name-${app.org_slug}`}>{app.owner_name}</p>
                                                        <p className="text-xs text-slate-400">{app.owner_email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {getPlanBadge(app.plan_requested)}
                                                        <p className="text-xs text-slate-500" data-testid={`cell-employees-${app.org_slug}`}>{app.employee_count} nhân viên</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(app.status)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setRejectReason('');
                                                            setDialogOpen(true);
                                                        }}
                                                        data-testid={`btn-view-app-${app.org_slug}`}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        {app.status === 'PENDING' ? 'Xét duyệt' : 'Xem chi tiết'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <Building2 className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                                                <h3 className="text-slate-900 font-bold mb-1">Không tìm thấy yêu cầu nào</h3>
                                                <p className="text-slate-500 text-sm">Hãy thử thay đổi tiêu chí lọc hoặc làm mới danh sách.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Detail/Action Dialog */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent className="sm:max-w-[550px]" data-testid="dialog-approval-detail">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">
                                    {selectedApp?.status === 'PENDING' ? 'Xét duyệt Đơn đăng ký' : 'Chi tiết Đơn đăng ký'}
                                </DialogTitle>
                                <DialogDescription>
                                    Mã đơn: <span className="font-mono">{selectedApp?.id}</span>
                                </DialogDescription>
                            </DialogHeader>

                            {selectedApp && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm">
                                            {selectedApp.org_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{selectedApp.org_name}</h3>
                                            <p className="text-sm text-slate-500">Mã Slug: {selectedApp.org_slug}</p>
                                        </div>
                                        <div className="ml-auto">
                                            {getStatusBadge(selectedApp.status)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Người đăng ký</p>
                                            <p className="font-medium" data-testid="detail-owner-name">{selectedApp.owner_name}</p>
                                            <p className="text-xs text-slate-400">{selectedApp.owner_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Gói đăng ký</p>
                                            <div className="mt-1" data-testid="detail-plan">{getPlanBadge(selectedApp.plan_requested)}</div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Quy mô</p>
                                            <p className="font-medium" data-testid="detail-employees">{selectedApp.employee_count} nhân viên</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium">Ngành nghề</p>
                                            <p className="font-medium" data-testid="detail-industry">{selectedApp.industry || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-slate-500 font-medium">Ngày đăng ký</p>
                                            <p className="font-medium text-slate-700">
                                                {new Date(selectedApp.submitted_at).toLocaleString('vi-VN')}
                                            </p>
                                        </div>

                                        {selectedApp.status === 'PENDING' && (
                                            <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 animate-pulse" data-testid="sod-warning-box">
                                                <Shield size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-amber-800 uppercase">Kiểm soát rủi ro (SoD)</p>
                                                    <p className="text-[11px] text-amber-700">Hệ thống đang kiểm tra tính độc lập giữa người tạo và người duyệt đơn.</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedApp.status === 'REJECTED' && selectedApp.reason && (
                                            <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="detail-reject-reason-box">
                                                <p className="text-xs text-red-500 font-medium">Lý do từ chối</p>
                                                <p className="text-red-700">{selectedApp.reason}</p>
                                            </div>
                                        )}
                                    </div>

                                    {selectedApp.status === 'PENDING' && (
                                        <>
                                            <div className="space-y-2 pt-4 border-t">
                                                <label className="text-sm font-semibold text-slate-700">
                                                    Phản hồi / Lý do từ chối
                                                </label>
                                                <Textarea
                                                    placeholder="Nhập ghi chú hoặc lý do nếu từ chối..."
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    rows={3}
                                                    data-testid="input-reject-reason"
                                                    className="resize-none border-slate-200 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold"
                                                    onClick={handleApprove}
                                                    disabled={isSubmitting}
                                                    data-testid="btn-approve"
                                                >
                                                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                                    Phê duyệt ngay
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-bold"
                                                    onClick={handleReject}
                                                    disabled={isSubmitting || !rejectReason.trim()}
                                                    data-testid="btn-reject"
                                                >
                                                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                                    Từ chối đơn
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-center text-slate-400 italic">
                                                * Khi phê duyệt, hệ thống sẽ tự động khởi tạo Org Admin và gửi email bàn giao.
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </PermissionGuard>
        </AppLayout>
    );
}

