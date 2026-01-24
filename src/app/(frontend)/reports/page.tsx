/**
 * Reports Page - Báo cáo định kỳ
 * 
 * User Stories:
 * - US-EMP-03-01: Tạo và gửi báo cáo tuần/tháng
 * - US-EMP-03-02: Xem/xuất lịch sử báo cáo của cá nhân
 * - US-EMP-03-03: Nhận thông báo và xem nhận xét của Leader/CEO
 * - US-MNG-04-03: PM xem và phản hồi báo cáo định kỳ của nhân sự
 * - US-CEO-03-01: CEO đọc báo cáo của bất kỳ nhân sự nào
 * - US-CEO-03-02: CEO thả reaction vào báo cáo
 * - US-CEO-03-03: CEO viết comment chỉ đạo
 * 
 * Access:
 * - EMP: Tạo và xem báo cáo của mình
 * - PM: Xem báo cáo của team, comment
 * - CEO: Xem tất cả, reaction, comment
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Calendar,
    MessageSquare,
    ThumbsUp,
    Flame,
    Heart,
    FileText,
    Loader2,
    ExternalLink,
    Send,
    Edit2,
    Search,
    Download,
    Clock,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

interface Report {
    id: string;
    submitted_by: { id: string; full_name: string };
    period_type: 'WEEK' | 'MONTH' | 'QUARTER';
    period_start: string;
    period_end: string;
    title: string;
    content: string;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
    reactions: { code: string; count: number }[];
    comments_count: number;
    created_at: string;
}

const PERIOD_TYPES = {
    WEEK: { label: 'Tuần', color: 'bg-blue-100 text-blue-700' },
    MONTH: { label: 'Tháng', color: 'bg-purple-100 text-purple-700' },
    QUARTER: { label: 'Quý', color: 'bg-indigo-100 text-indigo-700' },
};

const STATUS_CONFIG = {
    DRAFT: { label: 'Bản nháp', color: 'bg-amber-100 text-amber-700' },
    SUBMITTED: { label: 'Đã gửi', color: 'bg-blue-100 text-blue-700' },
    APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700' },
};

const REACTIONS = [
    { code: 'LIKE', emoji: '👍', label: 'Tốt' },
    { code: 'CLAP', emoji: '👏', label: 'Tuyệt vời' },
    { code: 'HEART', emoji: '❤️', label: 'Yêu thích' },
    { code: 'FIRE', emoji: '🔥', label: 'Xuất sắc' },
];

// Helper: get week range
const getWeekRange = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: new Date(monday), end: sunday };
};

// Helper: Get Period Dates
const getPeriodDates = (type: 'WEEK' | 'MONTH' | 'QUARTER', date: Date = new Date()) => {
    const d = new Date(date);
    if (type === 'WEEK') {
        const { start, end } = getWeekRange(d);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], key: `WEEK-${start.getFullYear()}-${Math.ceil(start.getDate() / 7)}` };
    }
    if (type === 'MONTH') {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], key: `MONTH-${d.getFullYear()}-${d.getMonth() + 1}` };
    }
    if (type === 'QUARTER') {
        const quarter = Math.floor(d.getMonth() / 3);
        const start = new Date(d.getFullYear(), quarter * 3, 1);
        const end = new Date(d.getFullYear(), (quarter + 1) * 3, 0);
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0], key: `QUARTER-${d.getFullYear()}-${quarter + 1}` };
    }
    return { start: '', end: '', key: '' };
};

// Report Card Component
const ReportCard = ({
    report,
    isManager,
    onView,
    onEdit
}: {
    report: Report;
    isManager: boolean;
    onView: () => void;
    onEdit?: () => void;
}) => {
    const periodConfig = PERIOD_TYPES[report.period_type];
    const statusConfig = STATUS_CONFIG[report.status];

    const formatPeriod = () => {
        const start = new Date(report.period_start).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const end = new Date(report.period_end).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${start} - ${end}`;
    };

    return (
        <Card
            className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={onView}
            data-testid={`report-card-${report.id}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {/* Author (for PM/CEO view) */}
                        {isManager && (
                            <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs font-bold">
                                        {report.submitted_by.full_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-slate-600">
                                    {report.submitted_by.full_name}
                                </span>
                            </div>
                        )}

                        {/* Period */}
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("text-xs font-bold border-none", periodConfig.color)}>
                                {periodConfig.label}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                <Calendar className="inline-block h-3 w-3 mr-1" />
                                {formatPeriod()}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-slate-900 line-clamp-1">
                            {report.title}
                        </h3>

                        {/* Status & Stats */}
                        <div className="flex items-center gap-3 mt-2">
                            <Badge className={cn("text-xs font-bold border-none", statusConfig.color)}>
                                {statusConfig.label}
                            </Badge>

                            {report.comments_count > 0 && (
                                <span className="flex items-center gap-1 text-xs text-slate-400">
                                    <MessageSquare size={12} /> {report.comments_count}
                                </span>
                            )}

                            {report.reactions.length > 0 && (
                                <span className="flex items-center gap-1 text-xs">
                                    {report.reactions.map(r => {
                                        const reaction = REACTIONS.find(rx => rx.code === r.code);
                                        return (
                                            <span key={r.code}>
                                                {reaction?.emoji} {r.count}
                                            </span>
                                        );
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {report.status === 'DRAFT' && !isManager && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-full"
                                onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                            >
                                <Edit2 size={14} />
                            </Button>
                        )}
                        <ExternalLink
                            size={16}
                            className="text-slate-300 group-hover:text-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function ReportsPage() {
    const { user, hasPermission } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [periodType, setPeriodType] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('WEEK');
    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const isManager = user?.role === 'PROJECT_MANAGER' || user?.role === 'CEO' || user?.role === 'ORG_ADMIN';
    const canCreate = hasPermission(PERMISSIONS.REPORT_CREATE);

    // Fetch reports
    const fetchReports = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('status', filter);
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`/api/reports?${params.toString()}`, {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setReports(data.data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchReports();
    }, [user, filter]);

    // Open create dialog
    const openCreateDialog = () => {
        const { start, end } = getPeriodDates('WEEK');
        setEditingId(null);
        setPeriodType('WEEK');
        setPeriodStart(start);
        setPeriodEnd(end);
        setTitle(`Báo cáo công việc tuần (${start} - ${end})`);
        setContent('');
        setFormErrors({});
        setIsDialogOpen(true);
    };

    // Open edit dialog
    const openEditDialog = (report: Report) => {
        setEditingId(report.id);
        setPeriodType(report.period_type);
        setPeriodStart(report.period_start);
        setPeriodEnd(report.period_end);
        setTitle(report.title);
        setContent(report.content);
        setFormErrors({});
        setIsDialogOpen(true);
    };

    const handlePeriodTypeChange = (type: 'WEEK' | 'MONTH' | 'QUARTER') => {
        setPeriodType(type);
        const { start, end } = getPeriodDates(type);
        setPeriodStart(start);
        setPeriodEnd(end);
        const label = type === 'WEEK' ? 'tuần' : type === 'MONTH' ? 'tháng' : 'quý';
        setTitle(`Báo cáo công việc ${label} (${start} - ${end})`);
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!periodStart) errors.periodStart = 'Vui lòng chọn ngày bắt đầu';
        if (!periodEnd) errors.periodEnd = 'Vui lòng chọn ngày kết thúc';
        if (periodStart && periodEnd && new Date(periodStart) > new Date(periodEnd)) {
            errors.periodEnd = 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu';
        }
        if (!title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
        if (!content.trim()) errors.content = 'Vui lòng nhập nội dung';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit report
    const handleSubmit = async (asDraft: boolean) => {
        if (!validateForm()) return;

        if (!asDraft && !confirm("Bạn có chắc chắn muốn GỬI báo cáo này? Sau khi gửi, Quản lý sẽ nhận được thông báo và bạn sẽ không thể xóa báo cáo này.")) {
            return;
        }

        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/reports/${editingId}` : '/api/reports';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    id: editingId,
                    period_type: periodType,
                    period_start: periodStart,
                    period_end: periodEnd,
                    title: title.trim(),
                    content: content.trim(),
                    status: asDraft ? 'DRAFT' : 'SUBMITTED'
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Không thể tạo báo cáo');
            }

            setIsDialogOpen(false);
            fetchReports();
        } catch (error: any) {
            setFormErrors({ submit: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <PermissionGuard permission={PERMISSIONS.REPORT_READ} showFullPageError>
                <div className="space-y-6 animate-in fade-in duration-700" data-testid="reports-page-container">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="reports-page-title">
                                <FileText className="inline-block mr-2 h-8 w-8 text-blue-600" />
                                {isManager ? 'Đánh giá Báo cáo' : 'Báo cáo của tôi'}
                            </h1>
                            <p className="text-slate-500 mt-1 font-medium">
                                {isManager
                                    ? 'Xem và phản hồi báo cáo của team.'
                                    : 'Tạo và theo dõi báo cáo định kỳ của bạn.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="text-slate-600 font-bold"
                                onClick={() => alert('Đang xuất báo cáo sang CSV...')}
                                data-testid="btn-export-reports"
                            >
                                <Download className="mr-2 h-4 w-4" /> Xuất File
                            </Button>
                            {canCreate && (
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                                    onClick={openCreateDialog}
                                    data-testid="btn-create-report"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tạo Báo Cáo
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="border-none shadow-sm" data-testid="report-filters">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {isManager && (
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Tìm theo tên nhân sự..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                                data-testid="reports-input-search"
                                            />
                                        </div>
                                    </div>
                                )}

                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger className="w-[160px]" data-testid="reports-filter-status">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tất cả</SelectItem>
                                        <SelectItem value="DRAFT">Bản nháp</SelectItem>
                                        <SelectItem value="SUBMITTED">Đã gửi</SelectItem>
                                        <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[160px]" data-testid="reports-filter-type">
                                        <SelectValue placeholder="Loại báo cáo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL" data-testid="type-option-all">Tất cả loại</SelectItem>
                                        <SelectItem value="WEEK" data-testid="type-option-week">Hàng tuần</SelectItem>
                                        <SelectItem value="MONTH" data-testid="type-option-month">Hàng tháng</SelectItem>
                                        <SelectItem value="QUARTER" data-testid="type-option-quarter">Hàng quý</SelectItem>
                                    </SelectContent>
                                </Select>

                                {isManager && (
                                    <Button
                                        variant="outline"
                                        onClick={() => fetchReports()}
                                        data-testid="reports-btn-search"
                                    >
                                        Tìm kiếm
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports List */}
                    {
                        loading ? (
                            <div className="grid gap-4" data-testid="reports-loading">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="grid gap-4" data-testid="reports-list">
                                {reports.map((report) => (
                                    <ReportCard
                                        key={report.id}
                                        report={report}
                                        isManager={isManager}
                                        onView={() => window.location.href = `/reports/${report.id}`}
                                        onEdit={() => openEditDialog(report)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="border-none shadow-sm" data-testid="reports-empty">
                                <CardContent className="py-16 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                                        <FileText className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        Chưa có báo cáo nào
                                    </h3>
                                    <p className="text-slate-500 mb-6">
                                        {isManager
                                            ? 'Chưa có nhân sự nào gửi báo cáo.'
                                            : 'Bắt đầu tạo báo cáo đầu tiên của bạn!'}
                                    </p>
                                    {canCreate && (
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={openCreateDialog}
                                            data-testid="btn-create-report-empty"
                                        >
                                            <Plus className="mr-2 h-4 w-4" /> Tạo Báo Cáo
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    }

                    {/* Create Report Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="sm:max-w-xl" data-testid="dialog-create-report">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Tạo Báo Cáo
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {formErrors.submit && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2 animate-in shake duration-300">
                                        <AlertCircle size={16} className="mt-0.5" />
                                        {formErrors.submit}
                                    </div>
                                )}
                                {/* Period Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Loại báo cáo <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={periodType} onValueChange={(val: any) => handlePeriodTypeChange(val)}>
                                        <SelectTrigger data-testid="select-period-type">
                                            <SelectValue placeholder="Chọn loại kỳ báo cáo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="WEEK">Báo cáo Tuần</SelectItem>
                                            <SelectItem value="MONTH">Báo cáo Tháng</SelectItem>
                                            <SelectItem value="QUARTER">Báo cáo Quý</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Period Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Từ ngày <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={periodStart}
                                            onChange={(e) => setPeriodStart(e.target.value)}
                                            className={formErrors.periodStart ? 'border-red-300' : ''}
                                            data-testid="input-period-start"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Đến ngày <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="date"
                                            value={periodEnd}
                                            onChange={(e) => setPeriodEnd(e.target.value)}
                                            className={formErrors.periodEnd ? 'border-red-300' : ''}
                                            data-testid="input-period-end"
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Tiêu đề <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Báo cáo công việc tuần..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className={formErrors.title ? 'border-red-300' : ''}
                                        data-testid="reports-input-title"
                                    />
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Nội dung <span className="text-red-500">*</span>
                                        </label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            onClick={async () => {
                                                if (!user || !periodStart || !periodEnd) return;
                                                try {
                                                    const res = await fetch(`/api/time-logs?date_from=${periodStart}&date_to=${periodEnd}`, {
                                                        headers: { 'x-user-id': user.id }
                                                    });
                                                    const data = await res.json();
                                                    const logs = data.data || [];
                                                    if (logs.length === 0) {
                                                        alert("Không tìm thấy dữ liệu Log Time trong khoảng thời gian này.");
                                                        return;
                                                    }

                                                    let logText = `1. CÔNG VIỆC ĐÃ HOÀN THÀNH (${periodStart} đến ${periodEnd}):\n`;
                                                    logs.forEach((l: any) => {
                                                        const duration = l.minutes >= 60 ? `${Math.floor(l.minutes / 60)}h ${l.minutes % 60}m` : `${l.minutes}m`;
                                                        logText += `- [${l.project.code}] ${l.task.title}${l.subtask ? ` / ${l.subtask.title}` : ''}: ${duration}${l.note ? ` (${l.note})` : ''}\n`;
                                                    });

                                                    logText += "\n2. KHÓ KHĂN & ĐỀ XUẤT:\n- (Vui lòng nhập tại đây)\n\n3. KẾ HOẠCH TIẾP THEO:\n- (Vui lòng nhập tại đây)";
                                                    setContent(logText);
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Lỗi khi lấy dữ liệu Log Time.");
                                                }
                                            }}
                                            title="Hệ thống tự động lấy danh sách Task/Subtask đã hoàn thành & có log time đổ vào nội dung nháp"
                                        >
                                            <Clock className="mr-1 h-3 w-3" /> Lấy dữ liệu Log Time
                                        </Button>
                                    </div>
                                    {formErrors.content && <p className="text-[10px] font-bold text-red-600 mb-1">{formErrors.content}</p>}
                                    <Textarea
                                        placeholder="1. Công việc đã hoàn thành&#10;- ...&#10;&#10;2. Khó khăn gặp phải&#10;- ..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={8}
                                        className={formErrors.content ? 'border-red-300' : ''}
                                        data-testid="input-content"
                                    />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="outline" data-testid="reports-btn-cancel">
                                        Hủy
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="outline"
                                    onClick={() => handleSubmit(true)}
                                    disabled={isSubmitting}
                                    data-testid="btn-save-draft"
                                >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Lưu nháp
                                </Button>
                                <Button
                                    onClick={() => handleSubmit(false)}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    data-testid="reports-btn-submit"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Gửi báo cáo
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </PermissionGuard>
        </AppLayout >
    );
}
