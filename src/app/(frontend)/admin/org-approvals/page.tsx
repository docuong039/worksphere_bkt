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
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

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
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            // Mock data - US-SYS-01-01/02
            const mockApps: OrgApplication[] = [
                {
                    id: 'app-1', org_name: 'TechStart Vietnam', org_slug: 'techstart-vn',
                    owner_name: 'Nguyễn Văn Founder', owner_email: 'founder@techstart.vn',
                    plan_requested: 'PROFESSIONAL', employee_count: 50, industry: 'Technology',
                    status: 'PENDING', submitted_at: '2025-01-19T14:00:00Z'
                },
                {
                    id: 'app-2', org_name: 'Design Studio XYZ', org_slug: 'design-studio-xyz',
                    owner_name: 'Trần Thị Designer', owner_email: 'designer@xyz.com',
                    plan_requested: 'BASIC', employee_count: 15, industry: 'Design',
                    status: 'PENDING', submitted_at: '2025-01-18T10:00:00Z'
                },
                {
                    id: 'app-3', org_name: 'Marketing Pro', org_slug: 'marketing-pro',
                    owner_name: 'Lê Văn Marketer', owner_email: 'marketer@pro.com',
                    plan_requested: 'ENTERPRISE', employee_count: 200, industry: 'Marketing',
                    status: 'PENDING', submitted_at: '2025-01-17T09:00:00Z'
                },
                {
                    id: 'app-4', org_name: 'Old Company', org_slug: 'old-company',
                    owner_name: 'Phạm Văn Old', owner_email: 'old@company.com',
                    plan_requested: 'FREE', employee_count: 5, industry: 'Other',
                    status: 'APPROVED', submitted_at: '2025-01-10T08:00:00Z',
                    processed_at: '2025-01-11T10:00:00Z', processed_by: 'System Admin'
                },
                {
                    id: 'app-5', org_name: 'Fake Corp', org_slug: 'fake-corp',
                    owner_name: 'Unknown Person', owner_email: 'fake@suspicious.com',
                    plan_requested: 'ENTERPRISE', employee_count: 1000, industry: 'Other',
                    status: 'REJECTED', submitted_at: '2025-01-09T12:00:00Z',
                    processed_at: '2025-01-10T14:00:00Z', processed_by: 'System Admin',
                    reason: 'Thông tin không xác thực'
                },
            ];
            setApplications(mockApps);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openDetailDialog = (app: OrgApplication) => {
        setSelectedApp(app);
        setRejectReason('');
        setDialogOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedApp) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setApplications(applications.map(a =>
                a.id === selectedApp.id
                    ? { ...a, status: 'APPROVED' as const, processed_at: new Date().toISOString(), processed_by: user?.full_name }
                    : a
            ));
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp || !rejectReason.trim()) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setApplications(applications.map(a =>
                a.id === selectedApp.id
                    ? {
                        ...a, status: 'REJECTED' as const, reason: rejectReason,
                        processed_at: new Date().toISOString(), processed_by: user?.full_name
                    }
                    : a
            ));
            setDialogOpen(false);
        } catch (error) {
            console.error(error);
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
            case 'FREE': return <Badge variant="outline">Free</Badge>;
            case 'BASIC': return <Badge className="bg-blue-100 text-blue-700">Basic</Badge>;
            case 'PROFESSIONAL': return <Badge className="bg-purple-100 text-purple-700">Professional</Badge>;
            case 'ENTERPRISE': return <Badge className="bg-slate-800 text-white">Enterprise</Badge>;
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
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="org-approvals-page">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                            <Building2 className="inline-block mr-3 h-8 w-8 text-blue-600" />
                            Duyệt đăng ký Org
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">
                            Xét duyệt yêu cầu tạo Organization mới (US-SYS-01-01/02)
                        </p>
                    </div>
                    <Button variant="outline" onClick={fetchApplications} data-testid="btn-refresh">
                        <RefreshCw className="mr-2 h-4 w-4" /> Làm mới
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card className="border-none shadow-sm border-l-4 border-l-amber-500" data-testid="stat-pending">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Chờ duyệt</p>
                                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm border-l-4 border-l-emerald-500" data-testid="stat-approved">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Đã duyệt</p>
                                <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm border-l-4 border-l-red-500" data-testid="stat-rejected">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Từ chối</p>
                                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="filters-card">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm theo tên org hoặc email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                        data-testid="input-search"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]" data-testid="filter-status">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả</SelectItem>
                                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                                    <SelectItem value="APPROVED">Đã duyệT</SelectItem>
                                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <Card className="border-none shadow-sm" data-testid="applications-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách yêu cầu</CardTitle>
                        <CardDescription>Các tổ chức đang chờ xét duyệt</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : filteredApps.length > 0 ? (
                            <Table data-testid="applications-table">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead className="font-bold">Tổ chức</TableHead>
                                        <TableHead className="font-bold">Người đăng ký</TableHead>
                                        <TableHead className="font-bold">Gói</TableHead>
                                        <TableHead className="font-bold">Quy mô</TableHead>
                                        <TableHead className="font-bold">Trạng thái</TableHead>
                                        <TableHead className="text-right font-bold">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApps.map((app) => (
                                        <TableRow key={app.id} data-testid={`app-row-${app.id}`}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium" data-testid={`app-name-${app.id}`}>{app.org_name}</p>
                                                    <p className="text-xs text-slate-400">{app.industry}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                            {app.owner_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{app.owner_name}</p>
                                                        <p className="text-xs text-slate-400">{app.owner_email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell data-testid={`app-plan-${app.id}`}>
                                                {getPlanBadge(app.plan_requested)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Users className="h-3 w-3 text-slate-400" />
                                                    {app.employee_count}
                                                </div>
                                            </TableCell>
                                            <TableCell data-testid={`app-status-${app.id}`}>
                                                {getStatusBadge(app.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openDetailDialog(app)}
                                                    data-testid={`btn-view-${app.id}`}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    {app.status === 'PENDING' ? 'Xét duyệt' : 'Xem'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-state">
                                <CheckCircle2 className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không có yêu cầu nào</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Detail/Action Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-lg" data-testid="detail-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Chi tiết yêu cầu</DialogTitle>
                            <DialogDescription>
                                Xem và xử lý yêu cầu tạo Organization
                            </DialogDescription>
                        </DialogHeader>
                        {selectedApp && (
                            <div className="space-y-4 py-4">
                                {/* Org Info */}
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                            {selectedApp.org_name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{selectedApp.org_name}</p>
                                            <p className="text-slate-500 text-sm">{selectedApp.org_slug}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Người đăng ký</p>
                                        <p className="font-medium">{selectedApp.owner_name}</p>
                                        <p className="text-xs text-slate-400">{selectedApp.owner_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Gói đăng ký</p>
                                        <div className="mt-1">{getPlanBadge(selectedApp.plan_requested)}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Quy mô</p>
                                        <p className="font-medium">{selectedApp.employee_count} nhân viên</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Ngành nghề</p>
                                        <p className="font-medium">{selectedApp.industry}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500 font-medium">Ngày đăng ký</p>
                                        <p className="font-medium">
                                            {new Date(selectedApp.submitted_at).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    {selectedApp.status === 'REJECTED' && selectedApp.reason && (
                                        <div className="col-span-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="text-xs text-red-500 font-medium">Lý do từ chối</p>
                                            <p className="text-red-700">{selectedApp.reason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Section for PENDING */}
                                {selectedApp.status === 'PENDING' && (
                                    <>
                                        <div className="space-y-2 pt-4 border-t">
                                            <label className="text-sm font-medium text-slate-700">
                                                Lý do từ chối (nếu từ chối)
                                            </label>
                                            <Textarea
                                                placeholder="Nhập lý do từ chối..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                rows={3}
                                                data-testid="input-reject-reason"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                onClick={handleApprove}
                                                disabled={isSubmitting}
                                                data-testid="btn-approve"
                                            >
                                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Phê duyệt
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={handleReject}
                                                disabled={isSubmitting || !rejectReason.trim()}
                                                data-testid="btn-reject"
                                            >
                                                {isSubmitting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Từ chối
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
