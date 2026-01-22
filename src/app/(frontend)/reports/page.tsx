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
    Download
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

// Report Card Component
const ReportCard = ({
    report,
    isManager,
    onView
}: {
    report: Report;
    isManager: boolean;
    onView: () => void;
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

                    <ExternalLink
                        size={16}
                        className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

// Main Page Component
export default function ReportsPage() {
    const { user } = useAuthStore();
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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const isManager = user?.role === 'PROJECT_MANAGER' || user?.role === 'CEO' || user?.role === 'ORG_ADMIN';

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
        setPeriodType('WEEK');
        setPeriodStart('');
        setPeriodEnd('');
        setTitle('');
        setContent('');
        setFormErrors({});
        setIsDialogOpen(true);
    };

    // Validate form
    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!periodStart) errors.periodStart = 'Vui lòng chọn ngày bắt đầu';
        if (!periodEnd) errors.periodEnd = 'Vui lòng chọn ngày kết thúc';
        if (!title.trim()) errors.title = 'Vui lòng nhập tiêu đề';
        if (!content.trim()) errors.content = 'Vui lòng nhập nội dung';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit report
    const handleSubmit = async (asDraft: boolean) => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    period_type: periodType,
                    period_start: periodStart,
                    period_end: periodEnd,
                    title: title.trim(),
                    content: content.trim(),
                    status: asDraft ? 'DRAFT' : 'SUBMITTED'
                })
            });

            if (!res.ok) throw new Error('Failed to create report');

            setIsDialogOpen(false);
            fetchReports();
        } catch (error) {
            console.error('Error creating report:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
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
                        {!isManager && (
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
                                    <SelectItem value="ALL">Tất cả loại</SelectItem>
                                    <SelectItem value="DAILY">Hàng ngày</SelectItem>
                                    <SelectItem value="WEEKLY">Hàng tuần</SelectItem>
                                    <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
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
                                {!isManager && (
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
                            {/* Period Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Loại báo cáo <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    {Object.entries(PERIOD_TYPES).map(([code, config]) => (
                                        <label
                                            key={code}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all",
                                                periodType === code
                                                    ? "bg-blue-50 border-blue-300 text-blue-700"
                                                    : "bg-white border-slate-200 hover:border-blue-200"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="periodType"
                                                value={code}
                                                checked={periodType === code}
                                                onChange={(e) => setPeriodType(e.target.value as any)}
                                                className="sr-only"
                                            />
                                            <span className="font-medium">{config.label}</span>
                                        </label>
                                    ))}
                                </div>
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
                                <label className="text-sm font-semibold text-slate-700">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
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
            </div >
        </AppLayout >
    );
}
