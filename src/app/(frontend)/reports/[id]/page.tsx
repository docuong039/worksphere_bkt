/**
 * Report Detail Page
 * 
 * Includes:
 * - Report content viewer
 * - CEO/Manager Reactions (US-CEO-03-02)
 * - Comments Section (US-CEO-03-03)
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
    SmilePlus
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

    if (loading) {
        return (
            <AppLayout>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            </AppLayout>
        );
    }

    if (!report) {
        return (
            <AppLayout>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy báo cáo</h2>
                    <Button variant="link" onClick={handleBack} className="mt-4">Quay lại danh sách</Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Top Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={handleBack} className="text-slate-500 hover:text-slate-900">
                        <ChevronLeft size={20} className="mr-1" /> Quay lại
                    </Button>
                    <div className="flex items-center gap-2">
                        {report.status === 'APPROVED' ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">
                                <CheckCircle2 size={12} className="mr-1" /> Đã duyệt
                            </Badge>
                        ) : (
                            <Badge className="bg-blue-50 text-blue-700 border-none font-bold">
                                <Clock size={12} className="mr-1" /> Chờ duyệt
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Report Content */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                                    {report.submitted_by.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-bold text-slate-900">{report.submitted_by.full_name}</h4>
                                <p className="text-xs text-slate-500">{report.submitted_by.email}</p>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
                            {report.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-blue-500" />
                                {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <FileText size={14} className="text-blue-500" />
                                Báo cáo {report.period_type}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-8">
                        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed min-h-[200px]">
                            {report.content}
                        </div>

                        {/* Reaction Bar (CEO Specific) */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {REACTIONS.map((r) => {
                                    const hasReacted = report.reactions?.find(rx => rx.code === r.code)?.users.includes(user?.id || '');
                                    return (
                                        <button
                                            key={r.code}
                                            onClick={() => handleReaction(r.code)}
                                            disabled={isReacting}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all transform hover:scale-110 active:scale-95",
                                                hasReacted ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                            title={r.label}
                                        >
                                            <span className="text-lg">{r.emoji}</span>
                                            {report.reactions?.find(rx => rx.code === r.code)?.count || 0}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                                Đã gửi lúc: {new Date(report.created_at).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
                            <MessageSquare size={18} className="text-blue-600" />
                            Phản hồi & Chỉ đạo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Comment */}
                        <div className="flex gap-4">
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
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handlePostComment}
                                        disabled={!commentText.trim() || isSubmittingComment}
                                        className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 rounded-full"
                                    >
                                        {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} className="mr-2" />}
                                        Gửi phản hồi
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Comment List */}
                        <div className="space-y-6 pt-4">
                            {report.comments?.map((comment) => (
                                <div key={comment.id} className="flex gap-4 group">
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
                                                    <span className="font-bold text-sm text-slate-900">{comment.user.full_name}</span>
                                                    {comment.user.role === 'CEO' && <Badge className="bg-amber-100 text-amber-700 text-[10px] py-0 px-1.5 border-none">CEO</Badge>}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!report.comments || report.comments.length === 0) && (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
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
