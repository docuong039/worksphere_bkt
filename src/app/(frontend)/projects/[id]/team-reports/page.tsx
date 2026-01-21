'use client';

import React, { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ArrowLeft,
    FileText,
    Plus,
    Calendar,
    Eye,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Clock,
    MoreVertical,
    RefreshCw,
    Send,
    Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface TeamReport {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    report_date: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    summary: string;
    tasks_completed: number;
    blockers: string[];
    created_at: string;
    reviewed_at?: string;
    reviewed_by?: string;
    rejection_reason?: string;
}

export default function TeamReportsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = use(params);
    const { user } = useAuthStore();
    const [reports, setReports] = useState<TeamReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // View/Action Dialog
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<TeamReport | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isPM = user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN';

    useEffect(() => {
        fetchReports();
    }, [projectId]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            setProjectName('Worksphere Platform');

            // Mock data - US-MNG-05-01/02/03
            const mockReports: TeamReport[] = [
                {
                    id: 'r1', title: 'Báo cáo tuần 3 - Tháng 1/2025', author_id: 'u1', author_name: 'Nguyễn Văn A',
                    report_date: '2025-01-20', status: 'SUBMITTED', summary: 'Hoàn thành các task liên quan đến authentication và dashboard.',
                    tasks_completed: 5, blockers: ['Waiting for API spec', 'Design review pending'],
                    created_at: '2025-01-20T14:00:00Z'
                },
                {
                    id: 'r2', title: 'Báo cáo tuần 3 - Tháng 1/2025', author_id: 'u2', author_name: 'Trần Thị B',
                    report_date: '2025-01-20', status: 'APPROVED', summary: 'Hoàn thành UI cho profile page và settings.',
                    tasks_completed: 4, blockers: [],
                    created_at: '2025-01-20T10:00:00Z', reviewed_at: '2025-01-20T15:00:00Z', reviewed_by: 'PM'
                },
                {
                    id: 'r3', title: 'Báo cáo tuần 2 - Tháng 1/2025', author_id: 'u3', author_name: 'Lê Văn C',
                    report_date: '2025-01-13', status: 'REJECTED', summary: 'Phát triển tính năng inbox.',
                    tasks_completed: 2, blockers: ['Backend chưa sẵn sàng'],
                    created_at: '2025-01-13T16:00:00Z', reviewed_at: '2025-01-14T09:00:00Z', reviewed_by: 'PM',
                    rejection_reason: 'Thiếu chi tiết về blockers, vui lòng bổ sung'
                },
                {
                    id: 'r4', title: 'Báo cáo tuần 3 - Tháng 1/2025', author_id: 'u4', author_name: 'Phạm Thị D',
                    report_date: '2025-01-20', status: 'DRAFT', summary: 'QA cho sprint 5...',
                    tasks_completed: 8, blockers: [],
                    created_at: '2025-01-20T11:00:00Z'
                },
            ];

            setReports(mockReports);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openViewDialog = (report: TeamReport) => {
        setSelectedReport(report);
        setRejectionReason('');
        setViewDialogOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedReport) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setReports(reports.map(r =>
                r.id === selectedReport.id
                    ? { ...r, status: 'APPROVED' as const, reviewed_at: new Date().toISOString(), reviewed_by: user?.full_name }
                    : r
            ));
            setViewDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedReport || !rejectionReason.trim()) return;
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setReports(reports.map(r =>
                r.id === selectedReport.id
                    ? {
                        ...r, status: 'REJECTED' as const, rejection_reason: rejectionReason,
                        reviewed_at: new Date().toISOString(), reviewed_by: user?.full_name
                    }
                    : r
            ));
            setViewDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT': return <Badge variant="outline" className="text-slate-500">Nháp</Badge>;
            case 'SUBMITTED': return <Badge className="bg-blue-100 text-blue-700">Đã gửi</Badge>;
            case 'APPROVED': return <Badge className="bg-emerald-100 text-emerald-700">Đã duyệt</Badge>;
            case 'REJECTED': return <Badge className="bg-red-100 text-red-700">Từ chối</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredReports = reports.filter(r => statusFilter === 'ALL' || r.status === statusFilter);
    const pendingCount = reports.filter(r => r.status === 'SUBMITTED').length;

    return (
        <AppLayout>
            <div className="space-y-6 animate-in fade-in duration-700" data-testid="team-reports-page">
                {/* Header */}
                <div>
                    <Button variant="ghost" asChild className="-ml-4 mb-4 text-slate-500">
                        <Link href={`/projects/${projectId}/overview`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại {projectName}
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="page-title">
                                <FileText className="inline-block mr-3 h-8 w-8 text-blue-600" />
                                Báo cáo của Team
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                Xem và duyệt báo cáo từ team (US-MNG-05-01/02/03)
                            </p>
                        </div>
                        {pendingCount > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 text-lg px-4 py-2">
                                <Clock className="mr-2 h-4 w-4" />
                                {pendingCount} chờ duyệt
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-sm" data-testid="filters-card">
                    <CardContent className="p-4 flex items-center gap-4">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px]" data-testid="filter-status">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                <SelectItem value="SUBMITTED">Đã gửi</SelectItem>
                                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                <SelectItem value="REJECTED">Từ chối</SelectItem>
                                <SelectItem value="DRAFT">Nháp</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-slate-500">
                            Hiển thị {filteredReports.length} / {reports.length} báo cáo
                        </span>
                    </CardContent>
                </Card>

                {/* Reports List */}
                <Card className="border-none shadow-sm" data-testid="reports-card">
                    <CardHeader className="border-b border-slate-100">
                        <CardTitle className="text-lg font-bold">Danh sách báo cáo</CardTitle>
                        <CardDescription>Báo cáo từ các thành viên trong team</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-6 space-y-4" data-testid="loading-skeleton">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : filteredReports.length > 0 ? (
                            <div className="divide-y divide-slate-100" data-testid="reports-list">
                                {filteredReports.map(report => (
                                    <div
                                        key={report.id}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors"
                                        data-testid={`report-row-${report.id}`}
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                {report.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-slate-900 truncate" data-testid={`report-title-${report.id}`}>
                                                    {report.title}
                                                </p>
                                                {getStatusBadge(report.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span>{report.author_name}</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {report.report_date}
                                                </span>
                                                <span>{report.tasks_completed} tasks hoàn thành</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openViewDialog(report)}
                                            data-testid={`btn-view-${report.id}`}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            {isPM && report.status === 'SUBMITTED' ? 'Duyệt' : 'Xem'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center" data-testid="empty-state">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Không có báo cáo nào</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* View/Approval Dialog */}
                <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                    <DialogContent className="sm:max-w-lg" data-testid="view-dialog">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Chi tiết báo cáo</DialogTitle>
                            <DialogDescription>
                                {selectedReport?.title}
                            </DialogDescription>
                        </DialogHeader>
                        {selectedReport && (
                            <div className="space-y-4 py-4">
                                {/* Author Info */}
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                                            {selectedReport.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedReport.author_name}</p>
                                        <p className="text-xs text-slate-500">Ngày: {selectedReport.report_date}</p>
                                    </div>
                                    <div className="ml-auto">{getStatusBadge(selectedReport.status)}</div>
                                </div>

                                {/* Content */}
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Tóm tắt công việc</p>
                                    <p className="text-slate-900">{selectedReport.summary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Tasks hoàn thành</p>
                                        <p className="text-2xl font-bold text-emerald-600">{selectedReport.tasks_completed}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">Blockers</p>
                                        <p className="text-2xl font-bold text-amber-600">{selectedReport.blockers.length}</p>
                                    </div>
                                </div>

                                {selectedReport.blockers.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-2">Chi tiết Blockers</p>
                                        <ul className="space-y-1">
                                            {selectedReport.blockers.map((b, i) => (
                                                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                                    <span className="text-amber-500">•</span> {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedReport.status === 'REJECTED' && selectedReport.rejection_reason && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-xs font-medium text-red-500 mb-1">Lý do từ chối</p>
                                        <p className="text-red-700">{selectedReport.rejection_reason}</p>
                                    </div>
                                )}

                                {/* PM Actions for SUBMITTED reports */}
                                {isPM && selectedReport.status === 'SUBMITTED' && (
                                    <>
                                        <div className="space-y-2 pt-2 border-t">
                                            <label className="text-sm font-medium text-slate-700">
                                                Lý do từ chối (nếu từ chối)
                                            </label>
                                            <Textarea
                                                placeholder="Nhập lý do..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                rows={2}
                                                data-testid="input-rejection-reason"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                onClick={handleApprove}
                                                disabled={isSubmitting}
                                                data-testid="btn-approve"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Phê duyệt
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={handleReject}
                                                disabled={isSubmitting || !rejectionReason.trim()}
                                                data-testid="btn-reject"
                                            >
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
