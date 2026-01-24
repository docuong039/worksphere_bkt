/**
 * Report Detail Page
 * 
 * User Stories:
 * - US-EMP-03-02: Xem/xuất lịch sử báo cáo của cá nhân
 * - US-EMP-03-03: Xem nhận xét của Leader/CEO
 * - US-CEO-03-01: CEO đọc báo cáo của bất kỳ nhân sự nào
 * - US-CEO-03-02: CEO thả reaction vào báo cáo
 * - US-CEO-03-03: CEO viết comment chỉ đạo
 * 
 * Access: EMP (own reports), PM (team), CEO (all)
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Calendar,
    FileText,
    MessageSquare,
    Send,
    Loader2,
    CheckCircle2,
    Clock,
    User,
    SmilePlus,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface ReportComment {
    id: string;
    user: { id: string; full_name: string; role: string };
    content: string;
    created_at: string;
}

interface ReportDetail {
    id: string;
    submitted_by: { id: string; full_name: string; email: string };
    period_type: string;
    period_start: string;
    period_end: string;
    title: string;
    content: string;
    status: string;
    reactions: { code: string; count: number; users: string[] }[];
    comments: ReportComment[];
    created_at: string;
}

const REACTIONS = [
    { code: 'LIKE', emoji: '👍', label: 'Tốt' },
    { code: 'CLAP', emoji: '👏', label: 'Tuyệt vời' },
    { code: 'HEART', emoji: '❤️', label: 'Yêu thích' },
    { code: 'FIRE', emoji: '🔥', label: 'Xuất sắc' },
    { code: 'INSIGHT', emoji: '💡', label: 'Hữu ích' },
];

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<ReportDetail | null>(null);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isReacting, setIsReacting] = useState(false);
    const [myReactions, setMyReactions] = useState<string[]>([]);

    const fetchReport = async () => {
        try {
            const res = await fetch(`/api/reports/${params.id}`, {
                headers: {
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                }
            });
            if (!res.ok) throw new Error('Report not found');
            const data = await res.json();
            setReport(data.data);

            // Extract user's reactions
            const userReactions = data.data.reactions
                ?.filter((r: any) => r.users?.includes(user?.id))
                .map((r: any) => r.code) || [];
            setMyReactions(userReactions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id && user) fetchReport();
    }, [params.id, user]);

    const handleBack = () => router.push('/reports');

    const handleReaction = async (code: string) => {
        if (isReacting || !user) return;
        setIsReacting(true);

        // Optimistic update
        const hasReacted = myReactions.includes(code);
        if (hasReacted) {
            setMyReactions(prev => prev.filter(r => r !== code));
        } else {
            setMyReactions(prev => [...prev, code]);
        }

        try {
            const res = await fetch(`/api/reports/${params.id}/react`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({ code })
            });
            if (res.ok) fetchReport();
        } catch (error) {
            console.error(error);
            // Rollback on error
            if (hasReacted) {
                setMyReactions(prev => [...prev, code]);
            } else {
                setMyReactions(prev => prev.filter(r => r !== code));
            }
        } finally {
            setIsReacting(false);
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || isSubmittingComment || !user) return;
        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/reports/${params.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id,
                },
                body: JSON.stringify({ content: commentText.trim() })
            });
            if (res.ok) {
                setCommentText('');
                fetchReport();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleExportPDF = () => {
        // Mock export
        alert('Đang xuất báo cáo sang PDF...');
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="space-y-6" data-testid="report-detail-loading">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </AppLayout>
        );
    }

    if (!report) {
        return (
            <AppLayout>
                <div className="text-center py-20" data-testid="report-not-found">
                    <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy báo cáo</h2>
                    <Button variant="link" onClick={handleBack} className="mt-4" data-testid="btn-back-to-list">
                        Quay lại danh sách
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const canReact = user?.role === 'CEO' || user?.role === 'PROJECT_MANAGER' || user?.role === 'ORG_ADMIN';

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" data-testid="report-detail-page">
                {/* Top Navigation */}
                <div className="flex items-center justify-between" data-testid="report-header">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="text-slate-500 hover:text-slate-900"
                        data-testid="btn-back"
                    >
                        <ChevronLeft size={20} className="mr-1" /> Quay lại
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPDF}
                            data-testid="btn-export-pdf"
                        >
                            <Download size={16} className="mr-1" /> Xuất PDF
                        </Button>
                        {report.status === 'APPROVED' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold" data-testid="badge-approved">
                                <CheckCircle2 size={12} className="mr-1" /> Đã duyệt
                            </Badge>
                        ) : (
                            <Badge className="bg-blue-50 text-blue-700 border-none font-bold" data-testid="badge-pending">
                                <Clock size={12} className="mr-1" /> Chờ duyệt
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Report Content */}
                <Card className="border-none shadow-sm overflow-hidden" data-testid="report-content-card">
                    <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-4 mb-6" data-testid="report-author">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                                    {report.submitted_by.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold text-slate-900" data-testid="author-name">{report.submitted_by.full_name}</h4>
                                <p className="text-xs text-slate-500" data-testid="author-email">{report.submitted_by.email}</p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-slate-900 leading-tight" data-testid="report-title">
                            {report.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 font-medium" data-testid="report-meta">
                            <span className="flex items-center gap-1.5" data-testid="report-period-badge">
                                <Calendar size={14} className="text-blue-500" />
                                <span data-testid="report-period-start">{new Date(report.period_start).toLocaleDateString('vi-VN')}</span> - <span data-testid="report-period-end">{new Date(report.period_end).toLocaleDateString('vi-VN')}</span>
                            </span>
                            <span className="flex items-center gap-1.5" data-testid="report-type-badge">
                                <FileText size={14} className="text-blue-500" />
                                Báo cáo <span className="uppercase">{report.period_type}</span>
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-8">
                        <div
                            className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed min-h-[200px]"
                            data-testid="report-body"
                        >
                            {report.content}
                        </div>

                        {/* Reaction Bar (CEO/PM Specific) */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between" data-testid="reaction-section">
                            <div className="flex items-center gap-3" data-testid="reaction-buttons">
                                {REACTIONS.map((r) => {
                                    const reactionData = report.reactions?.find(rx => rx.code === r.code);
                                    const hasReacted = myReactions.includes(r.code);
                                    const count = reactionData?.count || 0;

                                    return (
                                        <button
                                            key={r.code}
                                            onClick={() => handleReaction(r.code)}
                                            disabled={isReacting || !canReact}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-110 active:scale-95",
                                                hasReacted
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                                !canReact && "opacity-50 cursor-not-allowed hover:scale-100"
                                            )}
                                            title={canReact ? r.label : 'Chỉ CEO/PM mới được thả reaction'}
                                            data-testid={`btn-reaction-${r.code.toLowerCase()}`}
                                        >
                                            <span className="text-lg">{r.emoji}</span>
                                            <span data-testid={`reaction-count-${r.code.toLowerCase()}`}>{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-slate-400 font-medium" data-testid="report-timestamp">
                                Đã gửi lúc: {new Date(report.created_at).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <Card className="border-none shadow-sm" data-testid="comments-section">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                            <MessageSquare size={18} className="text-blue-600" />
                            Phản hồi & Chỉ đạo
                            <Badge variant="outline" className="ml-2" data-testid="comments-count">
                                {report.comments?.length || 0}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Comment */}
                        <div className="flex gap-4" data-testid="comment-form">
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarFallback className="bg-slate-200 text-slate-600 font-bold">
                                    {user?.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                                <Textarea
                                    placeholder="Viết nhận xét hoặc chỉ đạo của bạn..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="min-h-[100px] border-slate-200 focus:ring-blue-500 rounded-xl"
                                    data-testid="input-comment"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handlePostComment}
                                        disabled={!commentText.trim() || isSubmittingComment}
                                        className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 rounded-full"
                                        data-testid="btn-post-comment"
                                    >
                                        {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                                        Gửi phản hồi
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comment List */}
                        <div className="space-y-6 pt-4" data-testid="comments-list">
                            {report.comments?.map((comment, idx) => (
                                <div key={comment.id} className="flex gap-4 group" data-testid={`comment-${comment.id}`}>
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarFallback className={cn(
                                            "font-bold",
                                            comment.user.role === 'CEO' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {comment.user.full_name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-slate-900" data-testid={`comment-author-${comment.id}`}>
                                                        {comment.user.full_name}
                                                    </span>
                                                    {comment.user.role === 'CEO' && (
                                                        <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0 px-1.5 border-none">CEO</Badge>
                                                    )}
                                                    {comment.user.role === 'PROJECT_MANAGER' && (
                                                        <Badge className="bg-blue-100 text-blue-700 text-[10px] py-0 px-1.5 border-none">PM</Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {new Date(comment.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed" data-testid={`comment-content-${comment.id}`}>
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!report.comments || report.comments.length === 0) && (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200" data-testid="no-comments">
                                    <MessageSquare size={32} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-sm text-slate-400 italic">Chưa có bình luận nào.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

